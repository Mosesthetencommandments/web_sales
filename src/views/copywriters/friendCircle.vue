<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <div class="filter-item">
        <div class="filter-label">日期</div>
        <el-date-picker v-model="listQuery.date_range"
                        type="daterange"
                        format="yyyy-MM-dd"
                        value-format="yyyy-MM-dd"
                        align="right"
                        size="small"
                        :clearable="false"
                        unlink-panels
                        range-separator="~"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                        @change="handleFilter"
        ></el-date-picker>
      </div>
      <div class="filter-item">
        <div class="filter-label">客服部门</div>
        <el-cascader
          clearable
          size="small"
          :options="userGroupTree"
          change-on-select
          placeholder="选择"
          :props="defaultPropsGroup"
          v-model="userGroupOptions"
          @change="handleFilterGrounp">
        </el-cascader>
      </div>
      <div class="filter-float">
        <el-button class="filter-item" size="small" type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
      </div>
      <!--<el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary" icon="el-icon-edit">添加文案</el-button>-->
    </div>

    <null-result v-if="list.length === 0" v-loading="listLoading"></null-result>
    <!--<p v-if="list.length === 0" v-loading="listLoading" style="font-size: 16px;color: #333333;text-align: center;height: 80px;line-height: 80px;">无数据</p>-->

    <el-tabs v-loading="listLoading" v-else v-model="activeName" type="border-card">
      <el-tab-pane :key="key" v-for="(item, key, index) in list" :name="index + ''" :label="item.product.product_name" >
        <el-collapse v-model="activeName1"  @change="handleChange">
          <el-collapse-item v-for="(item1,key2) in formatArray2(item.date)" :title="item1.date + ' 共 ( ' + formatArray(item1).length + ' )  未审核 ( ' + is_verifiedCount(formatArray(item1)) + ' )'">
            <el-table :data="formatArray(item1)"
                      v-loading="listLoading"
                      element-loading-text="给我一点时间"
                      border
                      fit
                      highlight-current-row
                      style="width: 100%"
                      stripe>
              <el-table-column align="center" label="发送时间" width="185">
                <template slot-scope="scope">
                  <el-tag style="font-size: 14px" type="primary">{{scope.row.pushtime}}</el-tag>
                </template>
              </el-table-column>
              <el-table-column align="center" label="标签" width="140">
                <template slot-scope="scope">
                  <el-tag size="small" type="success" v-if="scope.row.is_company_type">全公司</el-tag>
                  <el-tag size="small" v-if="scope.row.is_must_send == 1" type="warning">必发</el-tag>
                </template>
              </el-table-column>
              <el-table-column align="center" label="标题">
                <template slot-scope="scope">
                  <span class="link-type" @click="handlPreview(scope.row,item,scope.row.pushtime)">{{scope.row.script}}</span>
                </template>
              </el-table-column>
              <el-table-column align="center" label="作者 / 修改 / 审核" width="240">
                <template slot-scope="scope">
                  <span v-if="scope.row.author !== null">{{scope.row.author.nickname}}</span>
                  <el-tooltip effect="dark" :content="scope.row.created_at" placement="top">
                    <i style="color: #aaa" v-if="scope.row.created_at !== null" class="el-icon-info"></i>
                  </el-tooltip> /
                  <span v-if="scope.row.operator !== null">{{scope.row.operator.nickname}}</span>
                  <el-tooltip effect="dark" :content="scope.row.updated_at" placement="top">
                    <i style="color: #aaa" v-if="scope.row.operator !== null" class="el-icon-info"></i>
                  </el-tooltip> /
                  <span v-if="scope.row.verifieder !== null">{{scope.row.verifieder.nickname}}</span>
                  <el-tooltip effect="dark" :content="scope.row.checked_time" placement="top">
                    <i style="color: #aaa" v-if="scope.row.verifieder !== null" class="el-icon-info"></i>
                  </el-tooltip>
                </template>
              </el-table-column>
              <el-table-column align="center" label="审核" width="80">
                <template slot-scope="scope">
                  <el-tag v-if="scope.row.is_verified == 1" type="success">通过</el-tag>
                  <el-button size="mini" v-if="scope.row.is_verified == 0" type="danger" @click="switchverified(scope.row,1)" style="cursor: pointer">未通过</el-button>
                </template>
              </el-table-column>
              <el-table-column align="center" label="操作" width="150">
                <template slot-scope="scope">
                  <el-button type="primary" size="mini" @click="handlPreview(scope.row,item,scope.row.pushtime)">预览</el-button>
                  <!--<el-button type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>-->
                  <!--<el-button type="success" size="mini" @click="handleUpdate(scope.row,'copy')">转发</el-button>-->
                  <!--<el-button type="success" size="mini" v-if="scope.row.is_verified == 0" @click="switchverified(scope.row,1)">审核通过</el-button>-->
                  <!--<el-button type="info" size="mini" @click="handlSendRecord(scope.row)">发送记录</el-button>-->
                  <!--<el-button type="danger" size="mini" @click="handledeleteSpeech(scope.row)">删除</el-button>-->
                </template>
              </el-table-column>
            </el-table>
          </el-collapse-item>
        </el-collapse>
      </el-tab-pane>
    </el-tabs>

    <div v-show="dialogFormVisible2"  class="fc">
      <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="80%">
        <el-row :gutter="50">
          <el-col :span="12" style="padding-right: 0px">
            <el-form :rules="speechRules" ref="DataForm2" :model="tempFriendCircle" label-position="left" label-width="100px" style='width: 100%;'>
              <el-form-item label="朋友圈标题" prop="script" >
                <el-input v-model="tempFriendCircle.script"></el-input>
              </el-form-item>
              <el-form-item label="内容" class="contents">
                <div id="editorElem1" style="text-align:left;" class="wangeditor"></div>
              </el-form-item>
              <!--<el-form-item label="所属部门" >-->
              <!--<el-checkbox v-model="check" disabled v-for="item in departmentArray" :label="item.department_name" :key="item.id"></el-checkbox>-->
              <!--</el-form-item>-->
              <el-form-item label="所属产品" >
                <el-checkbox-group v-model="tempFriendCircle.product_ids">
                  <el-checkbox  v-for="item in productarray" v-bind:label="item.id" :value="item.id" :key="item.product_name">{{item.product_name}}</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
              <el-form-item label="朋友圈类型">
                <el-radio-group size="small" v-model="tempFriendCircle.type" >
                  <el-radio-button :label="0">纯文字</el-radio-button>
                  <el-radio-button :label="1">图片</el-radio-button>
                  <el-radio-button :label="2">视频</el-radio-button>
                  <el-radio-button :label="3">转发文章</el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="上传图片" class="textarea" v-show="tempFriendCircle.type == 1">
                <el-upload
                  ref="uploadRefund"
                  :action="baseUrl"
                  list-type="picture-card"
                  :on-preview="handlePictureCardPreview"
                  :on-remove="handleRemove"
                  :on-success="handlePictureSuccess"
                  :on-exceed="handlelimit"
                  :before-upload="beforeImgUpload"
                  :file-list="fileList"
                  multiple
                  :limit="9"
                  name="image">
                  <i class="el-icon-plus"></i>
                  <div slot="tip" >只能上传jpg/png文件,图片大小不能超过5M</div>
                </el-upload>
              </el-form-item>
              <el-form-item label="视频" v-show="tempFriendCircle.type == 2">
                <el-upload :action="baseUrl2"
                           v-model="tempFriendCircle.video_url"
                           list-type="picture"
                           :on-preview="handlePictureCardPreview_video"
                           :on-remove="handleRemove_video"
                           :on-success="handlePictureSuccess_video"
                           :before-upload="beforeVideoUpload"
                           :file-list="fileList2"
                           :limit="1"
                           :on-exceed="handleExceed"
                           name="video">
                  <el-button size="small" type="primary">点击上传视频</el-button>
                  <div slot="tip" class="el-upload__tip">只能上传mp4文件，视频时长不超过10秒，大小不超过10M
                  </div>
                </el-upload>
              </el-form-item>
              <el-form-item label="链接图标" v-show="tempFriendCircle.type == 3" class="link">
                <el-upload ref="uploadRefund2"
                           :action="baseUrl"
                           list-type="picture-card"
                           :on-preview="handlePictureCardPreview"
                           :on-remove="handleRemove2"
                           :on-success="handlePictureSuccess2"
                           :on-exceed="handlelimit2"
                           :file-list="fileList3"
                           :limit="1"
                           name="image">
                  <i class="el-icon-plus"></i>
                  <div slot="tip" >只能上传jpg/png文件,图片大小不能超过1M</div>
                </el-upload>
              </el-form-item>
              <el-form-item label="文章标题" class="link_title" prop="link_title" v-if="tempFriendCircle.type == 3">
                <el-input v-model="tempFriendCircle.link_title"></el-input>
              </el-form-item>
              <el-form-item label="文章链接" class="link_content" prop="link_content" v-if="tempFriendCircle.type == 3">
                <el-input v-model="tempFriendCircle.link_content"/>
              </el-form-item>
              <el-form-item label="点赞" class="is_thumb_up">
                <el-radio-group size="small" v-model="tempFriendCircle.is_thumb_up">
                  <el-radio-button :label='1'>是</el-radio-button>
                  <el-radio-button :label='0'>否</el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="全公司可见" class="is_thumb_up">
                <el-radio-group size="small" v-model="tempFriendCircle.is_company_type">
                  <el-radio-button :label='1'>是</el-radio-button>
                  <el-radio-button :label='0'>否</el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="必发" class="is_praise">
                <el-radio-group size="small" v-model="tempFriendCircle.is_must_send">
                  <el-radio-button :label='1'>是</el-radio-button>
                  <el-radio-button :label='0'>否</el-radio-button>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="评论内容" class="comments">
                <div v-for="(item, index) in tempFriendCircle.comments" :key="item.idd">
                  <el-row style="margin-bottom: 20px">
                    <el-col :span="20">
                      <div :id="item.idd" class="wangeditor"></div>
                    </el-col>
                    <el-col :span="4" style="text-align: center">
                      延时
                      <el-input-number :min="0" style="width: 60px" size="mini" v-model="item.delay_time"/>
                      <el-button @click="delectCommect(index)" style="display: inline-block;" size="mini" type="danger" icon="el-icon-delete"></el-button>
                    </el-col>
                  </el-row>
                </div>
                <el-button  type="primary" size="mini" @click="addComments">新增评论</el-button>
              </el-form-item>
              <el-form-item label="使用时间" class="time">
                <template v-for="(item, index) in tempFriendCircle.pushtimes">
                  <el-row>
                    <el-col :span="20">
                      <el-date-picker
                        size="mini"
                        v-model="item.push_time"
                        type="datetime"
                        :clearable="false"
                        placeholder="选择发送时间"
                        align="right"
                        :picker-options="pickerOptions1"
                        value-format="yyyy-MM-dd HH:mm:ss">
                      </el-date-picker>
                    </el-col>
                    <el-col :span="3" :offset="1">
                      <el-button v-if="index !== 0" @click="delectPushTime(index)" style="display: inline-block;width: 100%;" size="mini" type="danger" icon="el-icon-delete"></el-button>
                    </el-col>
                  </el-row>
                </template>
                <el-button  type="primary" size="mini" @click="addAvailable_time">新增发布时间</el-button>
              </el-form-item>
              <el-form-item label="添加屏蔽" class="time">
                <template v-for="(itemm, index) in tempFriendCircle.masks">
                  <el-row >
                    <el-col :span="10">
                      <el-select
                        clearable
                        filterable
                        size="mini"
                        placeholder="微信号"
                        style="width:150px"
                        remote
                        :remote-method="getProductWeixinList"
                        :loading="getProductWeixinListLoading"
                        v-model="itemm.product_weixin_id">
                        <el-option v-for="item in productWeixinOptions" :key="item.id" :label="item.info" :value="item.id">
                        </el-option>
                      </el-select>
                    </el-col>
                    <el-col :span="11">
                      <el-input v-model="itemm.description" size="mini"></el-input>
                      <!--<el-select-->
                      <!--clearable-->
                      <!--filterable-->
                      <!--size="mini"-->
                      <!--placeholder="粉丝微信号"-->
                      <!--style="width:150px"-->
                      <!--remote-->
                      <!--:remote-method="getProductWeixinFansList"-->
                      <!--:loading="getProductWeixinFansListLoading"-->
                      <!--v-model="itemm.product_weixin_fans_id">-->
                      <!--<el-option v-for="item in productWeixinFansOptions" :key="item.product_weixin_fans_id" :label="item.product_weixin_fans.weixin_account" :value="item.product_weixin_fans_id">-->
                      <!--</el-option>-->
                      <!--</el-select>-->
                    </el-col>
                    <el-col :span="3" >
                      <el-button @click="tempFriendCircle.masks.splice(index, 1)" style="display: inline-block;width: 100%;" size="mini" type="danger" icon="el-icon-delete"></el-button>
                    </el-col>
                  </el-row>
                </template>
                <el-button  type="primary" size="mini" @click="addMasks">新增屏蔽</el-button>
              </el-form-item>
            </el-form>
          </el-col>
          <el-col :span="12">
            <div style="width: 400px;height: auto;overflow: hidden;background: #fff;float: left">
              <img class="preview_weixin" :src="wechat_img" >
              <div class="preview_content" >
                <p style="margin: 0 0 5px 0;padding: 0;font-weight: 600;color: #565cace6;font-size: 18px;line-height: 30px;">佰芝堂</p>
                <div class="preview_wangeditor" v-html="wangeditorContent"></div>
                <div v-if="tempFriendCircle.type == 1">
                  <ul :class="classObject2" id="viewer2">
                    <li :class="classObject"  v-for="(item, index) in previewimage" :key="item">
                      <img style="width: 100%;height:100%" :src="item" :alt=" index+1+'/' + previewimage.length">
                    </li>
                    <div style="clear: both;"></div>
                  </ul>
                </div>
                <video v-if="tempFriendCircle.type == 2 && previewvideo" width="100%" height="240" controls loop="loop" style="margin-top: 15px;">
                  <source :src="previewvideo" type="video/mp4">
                </video>
                <div style="padding: 2%;background: #f7f7f7;overflow: hidden;" v-if="tempFriendCircle.type == 3 && linkimage">
                  <div style="width: 20%;height: 0;padding-bottom: 20%;position: relative;float: left">
                    <img :src="linkimage" alt="" style="width: 100%;height: 100%;position: absolute">
                  </div>
                  <p :class="tempFriendCircle.link_title.length > 18 ? 'linkp1' : 'linkp2'" >
                    {{tempFriendCircle.link_title}}
                  </p>
                </div>
                <div style="height: 16px;text-align: left;line-height: 20px;margin-top: 10px;" v-if="wangeditorContent !== undefined || previewvideo !== undefined || previewimage.length !== 0">
                  {{tempFriendCircle.pushtimes[0].push_time}}
                  <div style="width: 25px;float: right;height: 16px;background: #565cace6;position: relative;border-radius: 2px">
                    <div style="width: 0px;height:0px;border-width: 4px;border-style: solid;border-color: transparent #565cace6 transparent transparent;position: absolute;top: 4px;left: -8px;"></div>
                    <div style="width: 5px;height: 5px;background: white;border-radius: 50%;float: left;margin:6px 0 7px 6px;"></div>
                    <div style="width: 5px;height: 5px;background: white;border-radius: 50%;float: left;margin:6px 0 7px 5px;"></div>
                  </div>
                </div>
                <div style="height: auto;text-align: left;line-height: 20px;position: relative;background: #f2f2f2;margin-top: 10px" v-if="tempFriendCircle.is_thumb_up === 1 || tempFriendCircle.comments.length > 0">
                  <div style="width: 0px;height:0px;border-left: solid 5px transparent;border-top: solid 5px transparent;border-bottom: solid 5px #f2f2f2;border-right: solid 5px transparent;position: absolute;top: -10px;left: 20px"></div>
                  <div style="margin-left: 6px;height: 30px;" v-if="tempFriendCircle.is_thumb_up === 1">
                    <span class="svg-container" style="line-height: 30px;font-size: 14px;color: #8D8FAC">
                      <svg-icon icon-class="prise2"></svg-icon>佰芝堂
                    </span>
                  </div>
                  <div v-if="tempFriendCircle.is_thumb_up === 1 && tempFriendCircle.comments.length > 0" style="height: 1px;background: #ccc"></div>
                  <div style="font-size: 14px;margin-left:6px;line-height: 30px;color: #8D8FAC" v-for="item in tempFriendCircle.comments">
                    <span style="color: #576b95">佰芝堂:</span>
                    <div class="preview_wangeditor2" style="color: black;" v-html="item.content"></div>
                    <time >({{item.delay_time}}分钟后)</time>
                  </div>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button v-if="dialogStatus === 'update'" type="primary" @click="updateData">确 定</el-button>
          <el-button v-else type="primary" @click="createFriendCircle" >新 建</el-button>
        </div>
      </el-dialog>
    </div>

    <el-dialog :title="time + '--' + product" id="previewDialog" :visible.sync="dialogFormVisible3" width="340px" style="margin-top: 0px">
      <!--<div>{{tempFriendCircle.script}}</div>-->
      <div class="phonebk">
        <div class="phone">
          <div class="previewContent">
            <img :src="wechat_img">
            <div class="text_content">
              <span style="font-weight: 600;color: #565cace6;font-size: 16px;line-height: 26px;">佰芝堂</span>
              <div class="preview_wangeditor" v-html="wangeditorContent"></div>
              <div v-if="tempFriendCircle.type == 1">
                <ul :class="classObject2" id="viewerPreview">
                  <li :class="classObject"  v-for="(item, index) of previewimage" :key="item" >
                    <img style="width: 100%;height:100%" :src="item" :alt="index + 1 + '/' + previewimage.length">
                  </li>
                  <div style="clear: both;"></div>
                </ul>
              </div>
              <video v-if="tempFriendCircle.type == 2 && previewvideo" width="100%" height="240" controls loop="loop" style="margin-top: 15px;">
                <source :src="previewvideo" type="video/mp4">
              </video>
              <div style="padding: 2%;background: #f7f7f7;overflow: hidden;" v-if="tempFriendCircle.type == 3 && linkimage">
                <div style="width: 20%;height: 0;padding-bottom: 20%;position: relative;float: left">
                  <img :src="linkimage" alt="" style="width: 100%;height: 100%;position: absolute">
                </div>
                <p :class="tempFriendCircle.link_title.length > 18 ? 'linkp1' : 'linkp2'" >
                  {{tempFriendCircle.link_title}}
                </p>
              </div>
              <div style="height: 16px;text-align: left;line-height: 20px;margin-top: 10px;" v-if="wangeditorContent !== undefined || previewvideo !== undefined || previewimage.length !== 0">
                {{tempFriendCircle.pushtimes[0].push_time}}
                <div style="width: 25px;float: right;height: 16px;background: #565cace6;position: relative;border-radius: 2px">
                  <div style="width: 0px;height:0px;border-width: 4px;border-style: solid;border-color: transparent #565cace6 transparent transparent;position: absolute;top: 4px;left: -8px"></div>
                  <div style="width: 5px;height: 5px;background: white;border-radius: 50%;float: left;margin:6px 0 7px 6px;"></div>
                  <div style="width: 5px;height: 5px;background: white;border-radius: 50%;float: left;margin:6px 0 7px 5px;"></div>
                </div>
              </div>
              <div style="height: auto;text-align: left;line-height: 20px;position: relative;background: #f2f2f2;margin-top: 10px" v-if="tempFriendCircle.is_thumb_up === 1  || tempFriendCircle.comments.length > 0">
                <div style="width: 0px;height:0px;border-left: solid 5px transparent;border-top: solid 5px transparent;border-bottom: solid 5px #f2f2f2;border-right: solid 5px transparent;position: absolute;top: -10px;left: 20px"></div>
                <div style="margin-left: 6px;height: 30px;" v-if="tempFriendCircle.is_thumb_up === 1">
                    <span class="svg-container" style="line-height: 30px;font-size: 14px;color: #8D8FAC">
                      <svg-icon icon-class="prise2"></svg-icon>
                      佰芝堂
                    </span>
                </div>
                <div style="font-size: 14px;margin-left:6px;line-height: 30px;color: #8D8FAC" v-for="item in tempFriendCircle.comments">
                  <span style="color: #576b95">佰芝堂:</span>
                  <div class="preview_wangeditor2" style="color: black" v-html="item.content"></div>
                  <time >({{item.delay_time}}分钟后)</time>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="imageDialogVisible">
      <img width="100%" :src="publicImageUrl">
    </el-dialog>

    <video style="display:none;" controls="controls" id="aa" ></video>

    <el-dialog title="预览视频" :visible.sync="dialogFormVisiblePreview" width="30%">
      <video v-if="dialogFormVisiblePreview" width="100%" height="240" controls="controls">
        <source :src="publicVideoUrl" type="video/mp4">
      </video>
    </el-dialog>

    <el-dialog title="发送记录" :visible.sync="imageDialogVisible3" width="70%" class="sendRecord">
      <el-row :gutter="10">
        <el-col :span="4" :offset="20">
          <el-row :gutter="10" style="margin-bottom: 20px">
            <el-col :span="12" >
              <div style="background: #ff9800;height: 18px;border-radius: 2px"></div>
            </el-col>
            <el-col :span="12" >
              <p style="text-align: center;font-size:14px;line-height: 18px;margin: 0">待评论</p>
            </el-col>
            <el-col :span="12" >
              <div style="background: #409EFF;height: 18px;border-radius: 2px"></div>
            </el-col>
            <el-col :span="12" >
              <p style="text-align: center;font-size:14px;line-height: 18px;margin: 0">已发送</p>
            </el-col>
            <el-col :span="12" >
              <div style="height: 18px;border-radius: 2px;border: 1px solid #bbb;"></div>
            </el-col>
            <el-col :span="12" >
              <p style="text-align: center;font-size:14px;line-height: 18px;margin: 0">未发送</p>
            </el-col>
          </el-row>
        </el-col>
        <el-col :span="4" v-for="item in sendRecordList" :key="item.id">
          <el-tooltip class="item" effect="dark" :content="item.support_member.nickname" placement="top">
            <div style="margin-bottom: 20px;border-radius: 4px;text-align: center;font-size: 14px;line-height:40px;border: 1px solid #333;"
                 :class="item.send_record.status | readStatusFilter">
              {{item.weixin_account}}
            </div>
          </el-tooltip>
        </el-col>
      </el-row>
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery2.page"
                     :page-sizes="[30,60,90]" :page-size="listQuery2.page_size" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-dialog>

    <el-dialog :visible.sync="imageDialogVisible1" width="60%">
      <el-carousel ref="carousel" indicator-position="outside" :autoplay="false" :initial-index="imageUrlIndex">
        <el-carousel-item
          v-for="(item,index) in previewimage"
          :key="item"
          :name="index + ''">
          <img :src="item" >
        </el-carousel-item>
      </el-carousel>
    </el-dialog>
  </div>
</template>

<script >
  import wechat_img from '@/assets/weixin.jpg'
  import { getUserAccountGroupTree } from '@/api/user_group'
  import { getCopywriteFriendCircleByProductAndDay, getCopywriteFriendCircleDetail, createCopywriteFriendCircle, deleteCopywriteFriendCircle, updateCopywriteFriendCircle, getCopywriteVideoList, checkCopywriteFriendCircle, getSendRecord } from '@/api/copywrite'
  import { getProductWeixinFansPivotList, getProductWeixinList } from '@/api/product_weixin'
  import { getProductList } from '@/api/product'
  import { getSupportGroupList } from '@/api/support_member'
  import { getSupportMemberList } from '@/api/support_member'
  import { wangEditor } from '@/utils/wang'
  import { parseTime } from '@/utils/index'
  import Viewer from 'viewerjs'
  import 'viewerjs/dist/viewer.css'
  import nullResult from '@/components/nullResult'

  export default {
    name: 'friendCircle',
    components: {
      nullResult
    },
    data() {
      const validate = (rule, value, callback) => {
        if (value) {
          const url = value.slice(0, 8)
          if (url.indexOf('https://') !== -1 || url.indexOf('http://') !== -1) {
            callback()
          } else {
            callback(new Error('只允许http://或https://开头'))
          }
        } else {
          callback(new Error('输入网址'))
        }
      }
      return {
        wechat_img,
        check: true,
        activeName: '0',
        activeName1: 0,
        userGroupOptions:[],
        userGroupTree: [],
        defaultPropsGroup: {
          children: 'child',
          label: 'group_name',
          value: 'id'
        },
        upVideo: true,
        upImage: true,
        imageDialogVisible1: false,
        dateDialogVisible3: false,
        dialogFormVisibleTime: false,
        filteroptions3: [
          { id: '+available_time', label: '时间' },
          { id: '-id', label: 'ID' }
        ],
        viewer3: undefined,
        imageUrl: '',
        departmentOptions: [],
        departmentLoading: false,
        viewerVisible: true,
        friend_btn: false,
        upImage2: false,
        sendRecordList: [],
        pickerOptions1: {
          shortcuts: [{
            text: '明天',
            onClick(picker) {
              const date = new Date()
              date.setTime(date.getTime() + 3600 * 1000 * 24)
              picker.$emit('pick', date)
            }
          }, {
            text: '三天后',
            onClick(picker) {
              const date = new Date()
              date.setTime(date.getTime() + 3600 * 1000 * 24 * 3)
              picker.$emit('pick', date)
            }
          }, {
            text: '一周后',
            onClick(picker) {
              const date = new Date()
              date.setTime(date.getTime() + 3600 * 1000 * 24 * 7)
              picker.$emit('pick', date)
            }
          }]
        },
        baseUrl: process.env.BASE_API + '/api/document/uploadImage',
        baseUrl2: process.env.BASE_API + '/api/document/uploadVideo',
        publicImageUrl: undefined,
        wangeditor1: wangEditor('#editorElem1', this.handleWangeditor),
        wangeditorContent: undefined,
        wangeditor_Json: undefined,
        speech: undefined,
        editorContent: '',
        tableKey: 0,
        previewdata: undefined,
        previewsVideoUrl: undefined,
        total: undefined,
        listLoading: false,
        list: {},
        checkproduct: [],
        previewVideoVisible: false,
        previewVideoVisible2: false,
        listQuery2: {
          page: 1,
          page_size: 30,
          date: undefined,
          product_id: undefined,
          friend_circle_id: undefined
        },
        listQuery: {
          page: 1,
          page_size: 20,
          sort: '-id',
          support_user_account_department_id: undefined,
          date_range: [
            parseTime(new Date(), '{y}-{m}-{d}'),
            parseTime(new Date().setTime(new Date().getTime() + 24 * 60 * 60 * 1000 * 7), '{y}-{m}-{d}')],
          author_id: undefined,
          is_verified: undefined,
          is_force: undefined
        },
        imageDialogVisible3: false,
        publicVideo: undefined,
        dialogStatus: '',
        linkimage: undefined,
        imageDialogVisible: false,
        dialogFormVisible: false,
        dialogFormVisible2: false,
        dialogFormVisible3: false,
        userAccountLoading: false,
        userAccountOptions: [],
        videoListOptions: [],
        previewimage: [],
        defaultProps3: {
          children: 'child',
          label: 'group_name',
          value: 'id'
        },
        previewvideo: undefined,
        getVideoListLoading: false,
        textMap: {
          update: '编辑',
          create: '创建',
          tag: '编辑标签'
        },
        filteroptions: [
          { id: 1, label: '强制' },
          { id: 0, label: '非强制' }
        ],
        upVideo2: false,
        filteroptions2: [
          { id: 1, label: '过审' },
          { id: 0, label: '未通过' }
        ],
        speechRules: {
          script: [{ required: true, message: '填写标题', trigger: 'change' }],
          link_title: [{ required: true, message: '填写内容', trigger: 'change' }],
          link_content: [{ validator: validate, trigger: 'change' }]
        },
        speechRules2: {
        },
        tempfriend_circle_id: undefined,
        friend_circle_id: undefined,
        tagTree: undefined,
        tempFriendCircle: {
          content: undefined,
          type: 0,
          script: undefined,
          is_thumb_up: 0,
          is_must_send: 1,
          is_company_type: 0,
          product_ids: [],
          pics: [],
          video_url: undefined,
          pushtimes: [
            {
              id: 0,
              push_time: parseTime(new Date(), '{y}-{m}-{d} {h}:00:00')
            }
          ],
          comments: [],
          masks: [],
          link_title: ' ',
          link_content: undefined,
          link_pics: undefined
        },
        userAccountGroupOptions:[],
        userAccountGroupTree: [],
        productarray: [],
        departmentArray: [],
        defaultProps: {
          children: 'user_account_group',
          label: (data, node) => {
            return data.group_name ? data.group_name : data.department_name
          }
        },
        product: undefined,
        time: undefined,
        temp_id: undefined,
        fileList: [],
        fileList2: [],
        fileList3: [],
        publicVideoUrl: undefined,
        dialogFormVisiblePreview: false,
        getProductWeixinListLoading: false,
        getProductWeixinFansListLoading: false,
        productWeixinOptions: [],
        productWeixinFansOptions: [],
        imageUrlIndex: undefined,
        tempWangEditor: [],
        commentIndex: undefined
      }
    },
    filters: {
      readStatusFilter(status) {
        const statusMap = {
          0: 'send_primary',
          1: 'send_warning',
          2: 'send_success'
        }
        return statusMap[status]
      }
    },
    computed: {
      departmentchecked() {
        return this.departmentArray.map(item => item.id)
      },
      classObject() {
        return {
          liBox1: this.previewimage.length === 1,
          liBox4: this.previewimage.length === 4,
          liBox6: this.previewimage.length === 2 || this.previewimage.length === 3 || this.previewimage.length > 4
        }
      },
      classObject2() {
        return {
          imgBox: this.previewimage.length !== 4,
          imgBox4: this.previewimage.length === 4
        }
      }
    },

    methods: {
      getUserGroupTree() {
        getSupportGroupList().then(response => {
          this.userGroupTree = this.formatUserGroupTree(response.data)
        })
      },
      formatUserGroupTree(tree) {
        const Group = tree.map(item => {
          if (item.child.length > 0) {
            item.child = this.formatUserGroupTree(item.child)
            return item
          } else {
            delete item.child
            return item
          }
        })
        return Group
      },
      handleFilterGrounp(val) {
        this.listQuery.support_user_account_group_id = val[val.length - 1]
        this.handleFilter()
      },
      getArray(data) {
        var temparray = []
        for (const v in data) {
          var temptime = []
          for (let i = 0; i < data[v].length; i++) {
            temptime.push(data[v][i].push_time)
          }
          const temp = Object.assign({}, data[v][0])
          temp.push_time = []
          temp.push_time = temptime
          temparray.push(temp)
        }
        return temparray
      },
      addAvailable_time() {
        this.tempFriendCircle.pushtimes.push({
          id: 0,
          push_time: parseTime(new Date(), '{y}-{m}-{d} {h}:00:00')
        })
      },
      addMasks() {
        this.tempFriendCircle.masks.push({ id: 0, product_weixin_id: undefined, description: undefined })
      },
      handleChange(val) {
      },
      getProductWeixinList(query) {
        if (query !== '') {
          this.getProductWeixinListLoading = true
          getProductWeixinList({ info: query, page_size: 0 }).then(response => {
            this.productWeixinOptions = response.data
            this.getProductWeixinListLoading = false
          })
        }
      },
      getProductWeixinFansList(query, data) {
        if (query !== '') {
          this.getProductWeixinFansListLoading = true
          getProductWeixinFansPivotList({ fans_weixin_account: query }).then(response => {
            this.productWeixinFansOptions = response.data.data
            this.getProductWeixinFansListLoading = false
          })
        }
      },
      addComments() {
        const i = this.tempFriendCircle.comments.length
        this.tempFriendCircle.comments.push({
          id: 0,
          idd: 'comment' + i,
          content: undefined,
          delay_time: undefined
        })
        this.$nextTick(() => {
          this.addWangeditor(i)
        })
      },
      addWangeditor(index) {
        this.commentIndex = index
        this.tempWangEditor.push({ wangeditor: wangEditor('#comment' + index, this.handleWangeditor2) })
        this.tempWangEditor[index].wangeditor.customConfig.menus = [
          'emoticon'
        ]
        this.tempWangEditor[index].wangeditor.create()
        this.$nextTick(() => {
          document.getElementById('comment' + index).addEventListener('click', () => {
            this.commentIndex = index
          })
        })
      },
      delectCommect(index) {
        this.tempFriendCircle.comments.splice(index, 1)
      },
      handleWangeditor(val) {
        this.wangeditorContent = this.wangeditor1.txt.html()
      },
      handleWangeditor2(val) {
        this.tempFriendCircle.comments[this.commentIndex].content = this.tempWangEditor[this.commentIndex].wangeditor.txt.html()
      },
      getProductList() {
        getProductList({ is_promote: 1, page_size: 0}).then(res => {
          this.productarray = res.data
        })
      },
      handleallproduct() {
        if (this.checkproduct.length === this.productarray.length) {
          this.checkproduct = []
        } else {
          this.checkproduct = []
          for (const v in this.productarray) {
            this.checkproduct.push(this.productarray[v].id)
          }
        }
      },
      getList() {
        this.listLoading = true
        this.list = {}
        getCopywriteFriendCircleByProductAndDay(this.listQuery).then(res => {
          this.list = res.data
          this.listLoading = false
        })
      },
      previewsVideo() {
        this.upImage = false
        if (this.tempUpdate.copywrite_video_id !== '') {
          this.upImage2 = false
        } else {
          this.upImage2 = true
        }
        for (const v in this.videoListOptions) {
          if (this.videoListOptions[v].id === this.tempFriendCircle.copywrite_video_id) {
            this.previewsVideoUrl = this.videoListOptions[v].video_url
          }
          if (this.videoListOptions[v].id === this.tempUpdate.copywrite_video_id) {
            this.previewsVideoUrl = this.videoListOptions[v].video_url
          }
        }
      },
      handlPreview(row, product, time) {
        this.dialogFormVisible3 = true
        this.product = product.product.product_name
        this.time = time
        getCopywriteFriendCircleDetail({ friend_circle_id: row.id }).then(res => {
          this.tempFriendCircle.pushtimes = res.data.push_time || []
          this.tempFriendCircle.comments = res.data.comment || []
          this.tempFriendCircle.masks = res.data.mask || []
          for (const v of res.data.product) {
            this.tempFriendCircle.product_ids.push(v.id)
          }
          if (res.data.content !== '<p><br></p>') {
            this.wangeditorContent = res.data.content
          } else {
            this.wangeditorContent = undefined
          }
          this.temp_id = row.id

          this.tempFriendCircle.content = res.data.content
          this.tempFriendCircle.script = res.data.script
          this.tempFriendCircle.is_must_send = res.data.is_must_send
          this.tempFriendCircle.is_thumb_up = res.data.is_thumb_up
          this.tempFriendCircle.type = res.data.type

          if (res.data.type === 1) {
            for (const v in res.data.type_content.pics) {
              this.previewimage.push(res.data.type_content.pics[v])
            }
            this.$nextTick(() => {
              this.viewer3 = new Viewer(document.getElementById('viewerPreview'), {
                'transition': false
              })
            })
          }
          if (res.data.type === 2) {
            this.previewvideo = res.data.type_content.video_url
          }
          if (res.data.type === 3) {
            this.tempFriendCircle.link_title = res.data.type_content.title
            this.tempFriendCircle.link_content = res.data.type_content.content_link
            this.tempFriendCircle.link_pics = res.data.type_content.link_pics
            this.linkimage = res.data.type_content.link_pics
            this.fileList3.push({ name: 'aaa', url: res.data.type_content.link_pics })
          }
        })
      },
      getSendRecord() {
        getSendRecord(this.listQuery2).then(res => {
          for (const v in res.data.data) {
            if (res.data.data[v].send_record === null) {
              res.data.data[v].send_record = {
                status: 0
              }
            }
          }
          this.sendRecordList = res.data.data
          this.total = res.data.total
        })
      },
      handlSendRecord(row) {
        const temparr = []
        for (const v in this.list) {
          temparr.push(this.list[v])
        }
        this.listQuery2.page = 1
        this.listQuery2.date = row.push_time.slice(0, 10)
        this.listQuery2.product_id = temparr[this.activeName].product.id
        this.listQuery2.friend_circle_id = row.id
        this.getSendRecord()
        this.imageDialogVisible3 = true
      },
      handleFilter() {
        this.listQuery.page = 1
        this.activeName = '0'
        this.getList()
      },
      getVideoList(query) {
        if (query !== '') {
          this.getVideoListLoading = true
          getCopywriteVideoList({ title: query }).then(response => {
            this.videoListOptions = response.data.data
            this.getVideoListLoading = false
          })
        }
      },
      handleSizeChange(val) {
        this.listQuery2.page_size = val
        this.getSendRecord()
      },
      handleCurrentChange(val) {
        this.listQuery2.page = val
        this.getSendRecord()
      },
      switchPerfectSpeech(row, data) {
        updateCopywriteFriendCircle({
          friend_circle_id: row.id,
          is_forced: data
        }).then(res => {
          for (const v in this.list) {
            if (this.list[v].id === res.data.id) {
              this.list[v].is_forced = data
            }
          }
        })
      },
      switchverified(row, data) {
        this.$confirm('审核通过?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          checkCopywriteFriendCircle({
            friend_circle_id: row.id,
            is_verified: data
          }).then(res => {
            this.$message({
              message: '审核通过',
              type: 'success'
            })
            this.getList()
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          })
        })
      },
      handledeleteSpeech(row) {
        this.$confirm('此操作将永久删除该朋友圈, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const temparr = []
          for (const v in this.list) {
            temparr.push(this.list[v])
          }
          deleteCopywriteFriendCircle({ friend_circle_id: row.id, product_id: temparr[this.activeName].product.id }).then(response => {
            this.$notify({
              title: '成功',
              message: '删除成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      },
      handleCreate() {
        this.dialogStatus = 'create'
        this.wangeditor1.txt.clear()
        // this.getSupportDepartment(this.$store.state.user.user_account_id)
        this.dialogFormVisible = true
        this.dialogFormVisible2 = true
        this.$nextTick(() => {
          this.$refs['DataForm2'].clearValidate()
        })
      },
      everyarray(obj) {
        let i = true
        for (const v in obj) {
          if (obj[v] === undefined) {
            i = false
            break
          }
        }
        return i
      },
      createFriendCircle() {
        if (this.tempFriendCircle.type === 1 && this.tempFriendCircle.pics.length === 0) {
          this.$message.error('上传图片')
          return false
        }
        if (this.tempFriendCircle.type === 2 && this.tempFriendCircle.video_url === undefined) {
          this.$message.error('上传视频')
          return false
        }
        if (this.tempFriendCircle.product_ids.length === 0) {
          this.$message.error('选择产品类型')
          return false
        }
        if (this.tempFriendCircle.comments.length !== 0 && !this.tempFriendCircle.comments.every(d => this.everyarray(d))) {
          this.$message.error('补全评论')
          return false
        }
        if (this.tempFriendCircle.masks.length !== 0 && !this.tempFriendCircle.masks.every(d => this.everyarray(d))) {
          this.$message.error('补全屏蔽信息')
          return false
        }
        this.$refs['DataForm2'].validate((valid) => {
          if (valid) {
            this.tempFriendCircle.content = this.wangeditor1.txt.html()
            createCopywriteFriendCircle(this.tempFriendCircle).then(() => {
              this.getList()
              this.dialogFormVisible = false
            })
          }
        })
      },
      handleUpdate(row, status) {
        this.dialogStatus = 'update'
        if (status && status === 'copy') {
          this.dialogStatus = 'create'
        }
        this.temp_id = row.id
        getCopywriteFriendCircleDetail({ friend_circle_id: row.id }).then(res => {
          if (res.data.mask) {
            for (const v of res.data.mask) {
              this.productWeixinOptions.push({ id: v.product_weixin.id, info: v.product_weixin.info })
            }
          }
          this.tempFriendCircle.pushtimes = res.data.push_time || []
          this.tempFriendCircle.comments = res.data.comment || []
          this.tempFriendCircle.masks = res.data.mask || []
          const fctype = row.type
          this.tempFriendCircle.type = row.type
          if (row.content !== `<p><br></p>`) {
            this.wangeditor1.txt.html(row.content)
            this.wangeditorContent = row.content
          } else {
            this.wangeditor1.txt.html()
            this.wangeditorContent = undefined
          }
          this.tempFriendCircle.content = row.content
          this.tempFriendCircle.script = row.script
          this.tempFriendCircle.is_must_send = row.is_must_send
          this.tempFriendCircle.is_thumb_up = row.is_thumb_up
          this.tempFriendCircle.is_company_type = row.is_company_type
          for (const v of res.data.product) {
            this.tempFriendCircle.product_ids.push(v.id)
          }
          if (status && status === 'copy') {
            this.tempFriendCircle.product_ids = []
          }
          if (fctype === 1) {
            for (const v of res.data.type_content.pics) {
              this.fileList.push({ name: v + '', url: v })
              this.previewimage.push(v)
              this.tempFriendCircle.pics.push(v)
            }
            this.$nextTick(() => {
              const galley = document.getElementById('viewer2')
              this.viewer3 = new Viewer(galley, {
                'transition': false
              })
              const index = this.tempFriendCircle.comments.length
              if (index > 0) {
                for (let v = 0; v < index; v++) {
                  this.addWangeditor(v)
                  this.tempWangEditor[v].wangeditor.txt.html(this.tempFriendCircle.comments[v].content)
                }
              }
              this.$refs['DataForm2'].clearValidate()
            })
          }
          if (fctype === 2) {
            this.previewvideo = res.data.type_content.video_url
            this.tempFriendCircle.video_url = res.data.type_content.video_url
            this.fileList2.push({ name: 'aaa', url: res.data.type_content.video_url })
          }
          if (fctype === 3) {
            this.tempFriendCircle.link_title = res.data.type_content.title
            this.tempFriendCircle.link_content = res.data.type_content.content_link
            this.tempFriendCircle.link_pics = res.data.type_content.link_pics
            this.linkimage = res.data.type_content.link_pics
            this.fileList3.push({ name: 'aaa', url: res.data.type_content.link_pics })
          }
          const index = this.tempFriendCircle.comments.length
          if (index > 0) {
            for (let i = 0; i < index; i++) {
              this.tempFriendCircle.comments[i].idd = 'comment' + i
            }
          }
          this.dialogFormVisible = true
          this.dialogFormVisible2 = true
        })
      },
      is_verifiedCount(item) {
        return item.filter(a => a.is_verified === 0).length
      },
      updateData() {
        console.log(1)
        if (this.tempFriendCircle.type === 1 && this.tempFriendCircle.pics.length === 0) {
          this.$message.error('上传图片')
          return false
        }
        console.log(2)

        if (this.tempFriendCircle.type === 2 && this.tempFriendCircle.video_url === undefined) {
          this.$message.error('上传视频')
          return false
        }
        if (this.tempFriendCircle.product_ids.length === 0) {
          this.$message.error('选择产品类型')
          return false
        }
        if (this.tempFriendCircle.comments.length !== 0 && !this.tempFriendCircle.comments.every(d => this.everyarray(d))) {
          this.$message.error('补全评论')
          return false
        }
        if (this.tempFriendCircle.masks.length !== 0 && !this.tempFriendCircle.masks.every(d => this.everyarray(d))) {
          this.$message.error('补全屏蔽信息')
          return false
        }
        this.$refs['DataForm2'].validate((valid) => {
          if (valid) {
            this.tempFriendCircle.content = this.wangeditor1.txt.html()
            const temp = Object.assign({ friend_circle_id: this.temp_id }, this.tempFriendCircle)
            updateCopywriteFriendCircle(temp).then(() => {
              this.getList()
              this.dialogFormVisible = false
            })
          }
        })
      },
      handlePictureCardPreview(file) {
        this.publicImageUrl = file.url
        this.imageDialogVisible = true
      },
      handlePictureCardPreview_video(file) {
        this.publicVideoUrl = file.url
        this.dialogFormVisiblePreview = true
      },
      handleExceed() {
        this.$message.warning(`限制上传1个视频`)
      },
      beforeVideoUpload(file) {
        const url = URL.createObjectURL(file)
        document.getElementById('aa').src = url
        const isLt10M = file.size / 1024 / 1024 < 10
        if (['video/mp4'].indexOf(file.type) === -1) {
          this.$message.error('上传正确的视频格式')
          return false
        }
        if (!isLt10M) {
          this.$message.error('上传视频大小不能超过10MB')
          return false
        }
      },
      delectPushTime(index) {
        if (index === 0) {
          this.$message.error('最少需要一个发送时间')
          return false
        }
        this.tempFriendCircle.pushtimes.splice(index, 1)
      },
      beforeImgUpload(file) {
        const isLt5M = file.size / 1024 / 1024 < 5
        if (['image/png'].indexOf(file.type) === -1 && ['image/jpeg'].indexOf(file.type) === -1) {
          this.$message.error('请上传正确的图片格式')
          return false
        }
        if (!isLt5M) {
          this.$message.error('上传图片大小不能超过5MB')
          return false
        }
      },
      formatArray2(data) {
        const array = []
        for (const v in data) {
          data[v]['date'] = v
          array.push(data[v])
        }
        array.sort((a, b) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        })
        return array
      },
      formatArray(data) {
        const array = []
        for (const v in data) {
          if (v !== 'date') {
            for (const i in data[v]) {
              array.push(data[v][i])
            }
          }
        }
        array.sort((a, b) => {
          return new Date(a.pushtime).getTime() - new Date(b.pushtime).getTime()
        })
        console.log(array)
        return array
      },
      handleRemove(file, fileList) {
        this.previewimage = []
        this.tempFriendCircle.pics = []
        if (this.dialogStatus === 'update') {
          for (const v in fileList) {
            this.previewimage.push(fileList[v].url)
            this.tempFriendCircle.pics.push(fileList[v].url)
          }
        } else {
          for (const v in fileList) {
            this.previewimage.push(process.env.BASE_API + fileList[v].response.data.url)
            this.tempFriendCircle.pics.push(process.env.BASE_API + fileList[v].response.data.url)
          }
        }
        if (this.viewer3 !== undefined) {
          this.viewer3.destroy()
        }
        this.$nextTick(() => {
          const galley = document.getElementById('viewer2')
          this.viewer3 = new Viewer(galley, {
            'transition': false,
            show: () => {
              this.viewer3.update()
            }
          })
        })
      },
      handleRemove_video(file, fileList) {
        this.tempFriendCircle.video_url = undefined
        this.previewvideo = undefined
      },
      handleRemove2(file, fileList) {
        this.tempFriendCircle.link_pics = undefined
        this.linkimage = undefined
      },
      handlePictureSuccess(response, file, fileList) {
        this.tempFriendCircle.pics.push(process.env.BASE_API + response.data.url)
        this.previewimage.push(process.env.BASE_API + response.data.url)
        if (this.viewer3 !== undefined) {
          this.viewer3.destroy()
        }
        this.$nextTick(() => {
          const galley = document.getElementById('viewer2')
          this.viewer3 = new Viewer(galley, {
            'transition': false,
            show: () => {
              this.viewer3.update()
            }
          })
        })
      },
      handlePictureSuccess2(response, file, fileList) {
        this.tempFriendCircle.link_pics = process.env.BASE_API + response.data.url
        this.linkimage = process.env.BASE_API + response.data.url
      },
      handlePictureSuccess_video(response, file, fileList) {
        if (document.getElementById('aa').duration > 10) {
          this.$message.error('视频时长' + parseInt(document.getElementById('aa').duration) + '秒,超过10秒')
          this.fileList2 = []
          return false
        }
        this.tempFriendCircle.video_url = process.env.BASE_API + fileList[0].response.data.url
        this.previewvideo = process.env.BASE_API + fileList[0].response.data.url
      },
      handlelimit(files, fileList) {
        this.$message.error('朋友圈最多上传9张图片')
      },
      handlelimit2(files, fileList) {
        this.$message.error('最多上传1张图片')
      },
      resetTempFriendCircle() {
        this.tempFriendCircle.content = undefined
        this.tempFriendCircle.type = 0
        this.tempFriendCircle.script = undefined
        this.tempFriendCircle.is_thumb_up = 0
        this.tempFriendCircle.is_must_send = 1
        this.tempFriendCircle.is_company_type = 0
        this.tempFriendCircle.product_ids = []
        this.tempFriendCircle.pics = []
        this.tempFriendCircle.video_url = undefined
        this.tempFriendCircle.pushtimes = [
          {
            id: 0,
            push_time: parseTime(new Date(), '{y}-{m}-{d} {h}:00:00')
          }
        ]
        this.linkimage = undefined
        this.previewvideo = undefined
        this.tempFriendCircle.comments = []
        this.tempFriendCircle.masks = []
        this.tempFriendCircle.link_title = ''
        this.tempFriendCircle.link_content = undefined
        this.tempFriendCircle.link_pics = undefined
        this.fileList = []
        this.fileList2 = []
        this.fileList3 = []
        this.previewimage = []
        this.productWeixinOptions = []
        this.productWeixinFansOptions = []
        this.wangeditor1.txt.clear()
      }
    },
    created() {
      this.getList()
      this.getUserGroupTree()
      this.getProductList()
    },
    watch: {
      imageDialogVisible3(val) {
        if (val === false) {
          this.sendRecordList = []
        }
      },
      dialogFormVisible(val) {
        if (val === false) {
          this.resetTempFriendCircle()
          this.wangeditorContent = undefined
          this.previewimage = []
          this.tempWangEditor = []
        }
      },
      dialogFormVisible3(val) {
        if (val === false) {
          this.resetTempFriendCircle()
          this.wangeditorContent = undefined
          this.previewimage = []
        }
      }
    },
    mounted() {
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.wangeditor1.customConfig.menus = [
          'emoticon'
        ]
        this.wangeditor1.create()
        this.dialogFormVisible = false
      })
    }
  }
</script>

<style scoped>
  .el-checkbox+.el-checkbox {
    margin-left: 0px;
  }
  .fc >>> .el-dialog{
    margin-top: 1vh!important;
  }
  .el-dialog__wrapper{
    /*z-index: 1300!important;*/
  }
  .el-dialog__wrapper >>> .el-dialog__header{
    padding: 10px;
  }
  .el-dialog__wrapper >>> .el-dialog__body{
    padding-top: 0px;
  }
  .el-checkbox-group >>> .el-checkbox{
    width: 20%;
  }
  .el-tree >>> .el-tree-node{
    margin: 8px 0;
  }
  .el-tree >>> .el-tree-node__expand-icon{
    font-size: 25px;
  }
  .el-tabs >>> .el-tabs__header{
    margin-bottom: 0px;
  }
  #editorElem1>>> .w-e-text{
    min-height: 250px;
  }
  .wangeditor >>> .w-e-text img{
    height: 20px;
    line-height: 20px;
    vertical-align: text-bottom!important;
  }
  .el-form-item__content >>> .w-e-text-container{
    height: 150px;
  }
  .preview_weixin{
    width: 12%;
    height: auto;
    float: left;
  }
  .preview_content{
    width: 85%;
    float: left;
    margin-left: 3%;
  }

  .imgBox {
    padding: 0;
  }
  .imgBox4 {
    padding: 0;
    width: 80%;
  }
  .imgBox li:last-child {
    margin-right: 0px;
  }
  .liBox6 {
    float: left;
    cursor: pointer;
    list-style-type: none;
    width: 30%;
    height: 100px;
    margin-right: 5px;
    margin-bottom: 5px;
  }
  .liBox4 {
    float: left;
    cursor: pointer;
    list-style-type: none;
    width: 45%;
    height: 100px;
    margin-right: 5%;
    margin-bottom: 5%;
  }
  .liBox1 {
    list-style-type: none;
    cursor: pointer;
    width: 60%;
  }

  .preview_wangeditor{
    font-size: 16px!important;
    letter-spacing: 2px!important;
    line-height: 1.2!important;
    width: 100%;
  }
  .preview_wangeditor2{
    font-size: 14px!important;
    line-height: 1.2!important;
    width: 100%;
  }
  /*.preview_wangeditor >>> img{*/
    /*width: 20px;*/
    /*display: inline-block;*/
    /*vertical-align: text-bottom!important;*/
  /*}*/
  .preview_wangeditor2 >>> img{
    width: 20px;
    display: inline-block;
    vertical-align: text-bottom!important;
  }
  .preview_wangeditor >>> span{
    font-size: 16px!important;
    letter-spacing: 2px!important;
    line-height: 1.2!important;
  }
  .preview_wangeditor2 >>> span{
    font-size: 16px!important;
    letter-spacing: 2px!important;
    line-height: 1.2!important;
  }
  .preview_wangeditor >>> p{
    /*width: 340px!important;*/
    /*height: auto;*/
    /*margin: 0;*/
    /*font-size: 16px!important;*/
    /*letter-spacing: 2px!important;*/
    /*line-height: 1.2!important;*/
    /*word-wrap:break-word;*/
    /*word-break:break-all;*/
    /*overflow: hidden;*/
  }
  .preview_wangeditor2 >>> p{
    width: 330px!important;
    height: auto;
    margin: 0;
    font-size: 14px!important;
    line-height: 1.2!important;
    word-wrap:break-word;
    word-break:break-all;
    overflow: hidden;
  }
  #editorElem1{
    width: 380px;
  }
  .wangeditor >>> span{
    font-size: 16px!important;
  }
  #editorElem1 >>> p{
    width: 340px!important;
    height: auto;
    margin: 0;
    font-size: 16px!important;
    line-height: 1.2;
    word-wrap:break-word;
    word-break:break-all;
    overflow: hidden;
  }
  .wangeditor >>> p{
    width: 320px!important;
    height: auto;
    margin: 0;
    font-size: 16px!important;
    line-height: 1.2;
    word-wrap:break-word;
    word-break:break-all;
    overflow: hidden;
  }
  .el-input-number--mini >>> .el-input-number__decrease{
    width: 15px;
  }
  .el-input-number--mini >>> .el-input-number__increase{
    width: 15px;
  }
  .el-input-number--mini >>> .el-input__inner{
    padding: 0px;
  }
  .is_praise >>> .el-checkbox-button__inner{
    border-radius: 4px;
  }
  .comment >>> .el-col-7 {
    font-size: 12px;
    text-align: center;
  }
  .el-col-21 >>> .el-input{
    width: 100%;
  }
  .time >>> .el-input{
    width: 100%;
  }
  .textarea >>>.el-upload{
    width: 120px;
    height: 120px;
    line-height: 120px;
  }
  .textarea >>>.el-upload-list__item{
    width: 120px;
    height: 120px;
  }
  .link >>> .el-upload{
    width: 120px;
    height: 120px;
    line-height: 120px;
  }
  .linkp1{
    float: left;
    height: 0;
    margin: 5% 0;
    width: 80%;
    padding: 0 2% 10% 2%;
    font-size: 0.9em;
    line-height: 1.3em;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }

  .linkp2{
    float: left;
    height: 0;
    margin: 2% 0;
    width: 80%;
    padding: 0 2% 16% 2%;
    font-size: 0.9em;
    line-height:3.6em;
    letter-spacing: 1px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }
  .el-collapse {
    border: none;
  }
  .el-collapse-item {
    border: none;
    border-bottom: 1px solid rgb(235, 238, 245);
  }
  .el-collapse-item >>> .el-collapse-item__header{
    font-size: 16px;
    font-weight: 600;
  }
  .el-collapse-item >>> .el-collapse-item__header {
    padding-left: 18px;
  }
  .send_primary{
    background: white;
  }
  .send_warning{
    background: #ff9800;
  }
  .send_success{
    background: #409eff;
  }
  .el-form-item >>> .w-e-item img {
    width: 100%;
  }
  .wangeditor >>> .w-e-item img{
    width: 100%;
  }
  .el-tabs >>> .el-tabs__content {
    padding: 0;
  }
  .wangeditor >>> .w-e-panel-container {
    width: 100%!important;
    margin-left: -50%!important;
  }
  .wangeditor >>> .w-e-emoticon-container .w-e-item {
    width: 10%!important;
  }

</style>
<!--预览-->
<style scoped lang="scss">
  #previewDialog {
    /deep/ .el-dialog{
      margin-top: 2vh!important;
      background: transparent!important;
      box-shadow: none!important;
    }
    /deep/ .el-dialog__header {
      display: none;
    }
    .phonebk {
      position: relative;
      width: 360px;
      height: 737px;
      margin: 0 auto;
      background: url('../../assets/iphone.png') no-repeat 0 0;
      background-size: 100% auto;
    }
    .phone{
      position: absolute;
      background: white;
      padding: 14px;
      width: 315px;
      height: 558px;
      top: 89px;
      left: 22px;
      overflow: auto;
    }
    .previewContent {
      width: 100%;
      display: flex;
      height: auto;
      overflow: hidden;
      margin: 0 auto;
      >img {
        width: 40px;
        height: 40px;
        margin-right: 10px;
        border-radius: 4px;
      }
      .text_content {
        width: 234px;
      }
      .preview_wangeditor{
        width: 100%;
        margin-top: 4px;
        font-size: 16px!important;
        letter-spacing: 2px!important;
        line-height: 1.2!important;
        /deep/ p {
          width: 100%!important;
          height: auto;
          margin: 0;
          font-size: 13px!important;
          letter-spacing: 1px!important;
          line-height: 1.2!important;
          word-wrap:break-word;
          word-break:break-all;
          overflow: hidden;
        }
        /deep/ img {
          width: 15px;
          display: inline-block;
          vertical-align: text-bottom!important;
        }
      }
    }
  }
</style>
