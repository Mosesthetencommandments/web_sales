<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-input
        @keyup.enter.native="handleFilter"
        style="width: 200px;"
        class="filter-item"
        placeholder="客户手机号"
        v-model="listQuery.phone"
      ></el-input>
      <el-select
        @change="handleFilter"
        style="width: 120px"
        class="filter-item"
        v-model="listQuery.sort"
        placeholder="排序"
      >
        <el-option
          v-for="item in sortOptions"
          :key="item.key"
          :label="item.label"
          :value="item.key"
        ></el-option>
      </el-select>
      <el-select
        class="filter-item"
        style="width:200px;"
        v-model="listQuery.product_weixin_id"
        filterable
        clearable
        remote
        placeholder="微信号"
        :remote-method="getProductWxList"
        :loading="productWxLoading">
        <el-option
          v-for="item in productWxOptions"
          :key="item.id"
          :label="item.weixin_account"
          :value="item.id">
          <span style="float: left">{{ item.weixin_account }}</span>
          <span style="float: right; color: #8492a6; font-size: 13px">{{ item.info }}</span>
        </el-option>
      </el-select>
      <el-button
        class="filter-item"
        type="primary"
        v-waves
        icon="el-icon-search"
        @click="handleFilter"
      >搜索
      </el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        @click="handleCreate"
        type="primary"
        icon="el-icon-edit"
      >添加
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      :data="list"
      v-loading="listLoading"
      element-loading-text="给我一点时间"
      border
      fit
      highlight-current-row
      style="width: 100%"
      stripe
    >
      <el-table-column align="center" label="序号" width="105">
        <template slot-scope="scope">
          <span>{{scope.row.id}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="商城客户信息">
        <template slot-scope="scope">
          <span v-if="scope.row.customer_shop !== null" class="link-type" @click="handleUpdate(scope.row)">
            {{scope.row.customer_shop.phone}}
            <br>
            <span v-if="scope.row.customer_shop.user_nickname !== ''">({{scope.row.customer_shop.user_nickname}})</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="所属客服">
        <template slot-scope="scope">
          <span class="link-type">{{scope.row.support_member.nickname}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="微信昵称">
        <template slot-scope="scope">
          <span class="link-type">{{scope.row.product_weixin.weixin_nickname}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="微信号">
        <template slot-scope="scope">
          <span class="link-type">{{scope.row.product_weixin.weixin_account}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="100px" align="center" label="备注">
        <template slot-scope="scope">
          <span class="link-type">{{scope.row.product_weixin.info}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="320" class-name="small-padding">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button type="primary" size="mini" @click="handleroos(scope.row)">社群二维码</el-button>
        </template>
      </el-table-column>

    </el-table>

    <div v-show="!listLoading" class="pagination-container">
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="listQuery.page"
        :page-sizes="[10,20,30, 50]"
        :page-size="listQuery.page_size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </div>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        :rules="rules"
        ref="dataForm"
        :model="temp"
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="客服" prop="support_member.id">
          <multiselect
            v-model="temp.support_member"
            :options="supportMemberOptions"
            @search-change="querySupportMemberList"
            placeholder="搜索客服"
            selectLabel="选择"
            deselectLabel="删除"
            track-by="nickname"
            :internalSearch="false"
            label="nickname"
          >
            <span slot="noResult">无结果</span>
          </multiselect>
        </el-form-item>
        <el-form-item label="推广微信号" prop="product_weixin.id">
          <multiselect
            v-model="temp.product_weixin"
            :options="productWeixinOptions"
            @search-change="queryProductWeixinList"
            placeholder="搜索推广微信号"
            selectLabel="选择"
            deselectLabel="删除"
            track-by="weixin_account"
            :internalSearch="false"
            label="weixin_account"
            :disabled="dialogStatus === 'update'"
          >
            <span slot="noResult">无结果</span>
          </multiselect>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="temp.phone" :disabled="dialogStatus === 'update'"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">确 定</el-button>
        <el-button v-else type="primary" @click="updateData">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 二维码弹框 -->

    <el-dialog :visible.sync="outerVisible" width="50%">
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="innerVisibles">上传</el-button>
      </div>
      <el-table :data="roost" border v-loading="outerTable" height="500" style="overflow: auto;max-height:500px;">
        <el-table-column property="id" label="序号" align="center"></el-table-column>
        <el-table-column property="name" label="名称" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column property label="二维码" align="center">
          <template slot-scope="scope">
            <img style="width:50px;height:50px;" :src="scope.row.qrcode" alt/>
          </template>
        </el-table-column>
        <el-table-column property="click" label="点击次数" align="center"></el-table-column>
        <el-table-column property label="状态" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status | statusTrans">{{scope.row.status | statusTrans}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column property="created_at" label="时间" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column align="center" label="操作" width="150" class-name="small-padding">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="updatas(scope.row)">修改</el-button>
            <el-button type="primary" size="mini" @click="deletes(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-dialog width="30%" :visible.sync="innerVisible" append-to-body title="创建">
        <el-form ref="forms" :model="loginForms">
          <el-form-item label="名称 :">
            <el-input v-model="loginForms.name"></el-input>
          </el-form-item>
          <el-form-item label="状态 :">
            <el-radio-group v-model="loginForms.status" size="small">
              <el-radio-button label="1">开启</el-radio-button>
              <el-radio-button label="2">关闭</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <el-upload
          :action="baseUrl"
          name="image"
          list-type="picture-card"
          :file-list="fileList"
          :on-remove="handleRemove"
          :before-upload="beforeAvatarUpload"
          :on-success="handleUps"
          multiple
        >
          <i class="el-icon-plus"></i>
        </el-upload>
        <span>只能上传jpg/png文件,图片大小不能超过１M</span>
        <div slot="footer" class="dialog-footer">
          <el-button @click="innerVisible = false">取 消</el-button>
          <el-button type="primary" @click="praevsor()">确 定</el-button>
        </div>
      </el-dialog>
    </el-dialog>

    <!-- 修改 -->
    <el-dialog width="30%" :visible.sync="innerVisiblesl" append-to-body title="修改">
      <el-form ref="forms" :model="loginFormsls">
        <el-form-item label="名称 :">
          <el-input v-model="loginFormsls.name"></el-input>
        </el-form-item>
        <el-form-item label="状态 :">
          <el-radio-group v-model="loginFormsls.status" size="small">
            <el-radio-button label=1>开启</el-radio-button>
            <el-radio-button label=2>关闭</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <el-upload
        :action="baseUrl"
        name="image"
        v-model="loginFormsls.qrcode"
        :file-list="fileList"
        list-type="picture-card"
        :on-remove="handleRemove"
        :before-upload="beforeAvatarUpload"
        :on-success="handleUp"
        multiple
      >
        <i class="el-icon-plus"></i>
      </el-upload>
      <span>只能上传jpg/png文件,图片大小不能超过１M</span>
      <div slot="footer" class="dialog-footer">
        <el-button @click="innerVisiblesl = false">取 消</el-button>
        <el-button type="primary" @click="praevsorsl()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {
    updateProduct,
    deleteProduct,
    getProductTemplateInfo,
    getProductTemplateList,
    createProductTemplate,
    updateProductTemplate,
    deleteProductTemplate,
    releaseProductTemplate,
    previewProductTemplate,
    erweima,
    chuangjian,
    deletesl,
    xiangqing,
    xiugai
  } from "@/api/product";
  import {
    createCustomerProductWeixin,
    getCustomerProductWeixinList,
    updateCustomerProductWeixin
  } from "@/api/customer";
  import {getSupportMemberList} from "@/api/support_member";
  import waves from "@/directive/waves"; // 水波纹指令
  import {getProductDeliverList} from "@/api/product";
  import {getProductWeixinList} from "@/api/product_weixin";
  import Multiselect from "vue-multiselect";
  import "vue-multiselect/dist/vue-multiselect.min.css"; // 多选框组件css
  export default {
    name: "customerManagement",
    components: {
      Multiselect
    },
    directives: {
      waves
    },
    data() {
      return {
        row: {},
        // baseUrl: "https://sales.api.7055.net/api/document/uploadImage",
        baseUrl: process.env.BASE_API + '/api/document/uploadImage',
        loginForms: {
          name: "",
          status: "1",
          qrcode: "",
          customer_id: ""
        },
        loginFormsls: {
          name: "",
          status: 1,
          qrcode: "",
          customer_id: ""
        },
        ids: "",
        roost: "",
        innerVisiblesl: false,
        minchen: "",
        scrollTop: 0,
        tableKey: 0,
        list: null,
        total: null,
        listLoading: true,
        userid: "",
        fileList: [],
        listQuery: {
          page: 1,
          page_size: 20,
          phone: undefined,
          product_weixin_id: undefined,
          is_promotion: undefined,
          sort: "-id"
        },
        formLabelWidth: "120px",
        importanceOptions: [1, 2, 3],
        sortOptions: [
          {label: "按ID升序列", key: "+id"},
          {label: "按ID降序", key: "-id"}
        ],
        statusOptions: ["published", "draft", "deleted"],
        showAuditor: false,
        outerTable: true,
        outerVisible: false,
        innerVisible: false,
        temp: {
          id: undefined,
          phone: "",
          product_weixin: {},
          support_member: {},
          product_weixin_id: undefined,
          support_user_account_id: undefined
        },
        dialogFormVisible: false,
        dialogTableVisibles: false,
        dialogStatus: "",
        textMap: {
          update: "编辑",
          create: "创建"
        },
        rules: {
          product_name: [
            {required: true, message: "请正确填写商品名称", trigger: "change"}
          ],
          product_deliver_id: [
            {required: true, message: "请正确填写商品名称", trigger: "change"}
          ]
        },
        innerList1: null,
        innerTotal1: null,
        innerTableKey1: 1,
        innerTableTitle1: "",
        innerListQuery1: {
          page: 1,
          page_size: 5,
          product_id: undefined,
          sort: "-id"
        },
        innerTemp1: {
          id: undefined,
          product_id: undefined,
          template_name: "",
          template_code: ""
        },
        innerListLoading1: false,
        innerTableVisible1: false,
        innerDialogFormVisible1: false,
        innerRules1: {
          template_name: [
            {required: true, message: "请正确填写模板名称", trigger: "change"}
          ],
          template_code: [
            {required: true, message: "请正确填写模板内容", trigger: "change"}
          ]
        },
        productType: {
          1: "推广",
          2: "附属产品"
        },
        productTypeOptions: [
          {key: 0, display_name: "裂变粉"},
          {key: 1, display_name: "推广粉"}
        ],
        previewDialogVisible: false,
        previewTitle: "",
        previewContent: "",
        getProductDeliverListLoading: false,
        productDeliverOptions: [],
        promotionFans: 1,
        fissionFans: 0,
        supportMemberOptions: [],
        productWeixinOptions: [],
        productWxOptions: [],
        productWxLoading: false
      };
    },
    filters: {
      statusFilter(status) {
        const statusMap = {
          1: "success",
          2: "info",
          3: "danger"
        };
        return statusMap[status];
      },
      statusTranslator(status) {
        const statusMap = {
          1: "推广",
          2: "附属产品"
        };
        return statusMap[status];
      },
      statusTrans(status) {
        const statusMap = {
          1: "正常",
          2: "禁用"
        };
        return statusMap[status];
      }
    },
    created() {
      this.getList();
    },
    methods: {
      getProductWxList(query) {
        if (query) {
          this.productWxLoading = true
          getProductWeixinList({ weixin_account: query }).then(response => {
            if (!response.data.data) return
            this.productWxOptions = response.data.data.map(v => ({
              id: v.id,
              weixin_account: v.weixin_account,
              info: v.info
            }))
            this.productWxLoading = false
          })
        }
      },
      praevsorsl(row) {
        this.innerVisiblesl = false;
        xiugai({id: this.userid, ...this.loginFormsls}).then(res => {

          this.$notify({
            title: "成功",
            message: "修改成功",
            type: "success"
          });
          this.handleroos(this.row)
        });
      },
      updatas(row) {
        this.innerVisiblesl = true;
        xiangqing({id: row.id}).then(res => {
          this.fileList = [
            {
              url: row.qrcode
            }
          ];
          this.loginFormsls = res.data.data

          this.userid = res.data.data.id;
        });
      },
      deletes(row) {
        deletesl({id: row.id}).then(res => {
          this.$notify({
            title: "成功",
            message: "删除成功",
            type: "success"
          });
          this.handleroos(this.row)
        });
      },
      handleUp(response, file, fileList) {
        this.loginFormsls.qrcode = response.data.url;
      },
      handleUps(response, file, fileList) {
        this.loginForms.qrcode = response.data.url;
      },
      praevsor() {
        chuangjian(this.loginForms).then(res => {
          this.innerVisible = false;
          this.loginForms.name = [];
          this.$notify({
            title: "成功",
            message: "创建成功",
            type: "success"
          });
          this.fileList = [];
        });
      },
      handleroos(row) {
        this.roost = null
        this.row = row;
        this.loginForms.customer_id = row.customer_id
        console.log(this.loginForms.customer_id, 11111)
        this.outerTable = true
        this.outerVisible = true;
        erweima({customer_id: row.customer_id}).then(res => {
          this.roost = res.data;
          this.outerTable = false
        })

        this.outerTable = false
      },
      handleRemove(file, fileList) {

      },
      handlePreview(file) {

      },
      handleExceed(files, fileList) {
        this.$message.warning(
          `当前限制选择 3 个文件，本次选择了 ${
            files.length
            } 个文件，共选择了 ${files.length + fileList.length} 个文件`
        );
      },
      beforeAvatarUpload(file) {
        const isJPG = file.type === "image/jpeg" || "image/png";
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isJPG) {
          this.$message.error("上传图片只能是 JPG png 格式!");
        }
        if (!isLt2M) {
          this.$message.error("上传图片大小不能超过 2MB!");
        }
        return isJPG && isLt2M;
      },
      beforeRemove(file, fileList) {
        return this.$confirm(`确定移除 ${file.name}？`);
      },
      innerVisibles() {
        this.innerVisible = true;
        this.outerVisible = false;
        this.fileList = []
      },
      queryProductWeixinList(query) {
        if (!this.temp.support_member.id) {
          this.$message({
            type: "info",
            message: "请先选择客服"
          });
          return;
        }
        const tempData = {};
        tempData.weixin_account = query;
        if (
          this.$store.state.user.roles === "administrator" ||
          this.$store.state.user.roles === "supportDirector" ||
          this.$store.state.user.roles === "supportManager"
        ) {
          // alert(this.$store.state.user.roles)
        } else {
          tempData.support_user_account_id = this.temp.support_member.id;
        }
        getProductWeixinList(tempData).then(response => {
          if (!response.data.data) return;
          this.productWeixinOptions = response.data.data;
          for (const v of this.productWeixinOptions) {
            v.weixin_account = v.weixin_account + "  (" + v.info + ")";
            const index = this.productWeixinOptions.indexOf(v);
            this.productWeixinOptions.splice(index, 1, v);
          }
        });
      },
      querySupportMemberList(query) {
        getSupportMemberList({
          nickname: query,
          user_account_type_code: "support",
          status: "1"
        }).then(response => {
          if (!response.data.data) return;
          this.supportMemberOptions = response.data.data;
        });
      },
      async getList() {
        try {
          this.listLoading = true;
          const response = await getCustomerProductWeixinList(this.listQuery);
          this.loginForms.customer_id = response.data.data[0].customer_id;
          this.loginFormsls.customer_id = response.data.data[0].customer_id;
          this.list = response.data.data;
          this.ids = response.data.data[0].customer_id;
          this.total = response.data.total;
        } catch (e) {
          this.$router.push({path: "/shop/bindCustomer"});
        } finally {
          this.listLoading = false;
        }
      },
      handleFilter() {
        this.listQuery.page = 1;
        this.getList();
      },
      handleSizeChange(val) {
        this.listQuery.page_size = val;
        this.getList();
      },
      handleCurrentChange(val) {
        this.listQuery.page = val;
        this.getList();
      },
      handleModifyStatus(row, status) {
        this.$message({
          message: "操作成功",
          type: "success"
        });
        row.status = status;
      },
      resetTemp() {
        this.temp = {
          id: undefined,
          phone: "",
          product_weixin: {},
          support_member: {},
          product_weixin_id: undefined,
          support_user_account_id: undefined
        };
      },
      handleCreate() {
        this.resetTemp();
        this.dialogStatus = "create";
        this.dialogFormVisible = true;
        this.$nextTick(() => {
          this.$refs["dataForm"].clearValidate();
        });
      },
      createData() {
        this.$refs["dataForm"].validate(valid => {
          if (valid) {
            this.temp.product_weixin_id = this.temp.product_weixin.id;
            this.temp.support_user_account_id = this.temp.support_member.id;
            createCustomerProductWeixin(this.temp).then(response => {
              this.getList();
              this.dialogFormVisible = false;
              this.total++;
              this.$notify({
                title: "成功",
                message: "创建成功",
                type: "success",
                duration: 2000
              });
            });
          }
        });
      },
      handleUpdate(row) {
        this.productDeliverOptions = [];
        this.temp = Object.assign({}, row); // copy obj
        this.dialogStatus = "update";
        this.dialogFormVisible = true;
        this.$nextTick(() => {
          this.$refs["dataForm"].clearValidate();
        });
      },
      updateData() {
        this.$refs["dataForm"].validate(valid => {
          if (valid) {
            const tempData = Object.assign({}, this.temp);
            tempData.support_user_account_id = this.temp.support_member.id;
            tempData.product_weixin_id = this.temp.product_weixin.id;
            updateCustomerProductWeixin(tempData).then(() => {
              this.getList();
              this.dialogFormVisible = false;
              this.$notify({
                title: "成功",
                message: "更新成功",
                type: "success",
                duration: 2000
              });
            });
          }
        });
      },
      getProductDeliverList(query) {
        if (query !== "") {
          this.getProductDeliverListLoading = true;
          getProductDeliverList({name: query}).then(response => {
            this.productDeliverOptions = response.data.data;
            this.getProductDeliverListLoading = false;
          });
        }
      },
      handleDelete(row) {
        this.$confirm("此操作将永久删除该商品, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(() => {
            const ttempData = {
              product_id: row.id
            };
            deleteProduct(ttempData).then(response => {
              this.$notify({
                title: "成功",
                message: "删除成功",
                type: "success",
                duration: 2000
              });
              const index = this.list.indexOf(row);
              this.list.splice(index, 1);
              this.total--;
            });
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "已取消删除"
            });
          });
      },
      handleOpenInner1(row) {
        this.innerTableVisible1 = true;
        this.innerTableTitle1 = row.product_name + " -- 模板";
        this.temp = Object.assign({}, row); // copy obj
        this.getInnerList1();
      },
      getInnerList1() {
        this.innerListQuery1.product_id = this.temp.id;
        this.innerTemp1.product_id = this.temp.id;
        this.innerListLoading1 = true;
        getProductTemplateList(this.innerListQuery1).then(response => {
          this.innerList1 = response.data.data;
          this.innerTotal1 = response.data.total;
          this.innerListLoading1 = false;
        });
      },
      handleInnerFilter1() {
        this.innerListQuery1.page = 1;
        this.getInnerList1();
      },
      handleInnerSizeChange1(val) {
        this.innerListQuery1.page_size = val;
        this.getInnerList1();
      },
      handleInnerCurrentChange1(val) {
        this.innerListQuery1.page = val;
        this.getInnerList1();
      },
      resetInnerTemp1() {
        this.innerTemp1 = {
          id: undefined,
          product_id: undefined,
          template_name: "",
          template_code: ""
        };
      },
      handleInnerCreate1() {
        this.resetInnerTemp1();
        this.dialogStatus = "create";
        this.innerDialogFormVisible1 = true;
        this.innerTemp1.product_id = this.temp.id;
        this.$nextTick(() => {
          this.$refs["innerDataForm1"].clearValidate();
        });
      },
      createInnerData1() {
        this.$refs["innerDataForm1"].validate(valid => {
          if (valid) {
            createProductTemplate(this.innerTemp1).then(response => {
              this.innerTotal1++;
              this.innerTemp1 = response.data;
              this.innerList1.unshift(this.innerTemp1);
              this.innerDialogFormVisible1 = false;
              this.$notify({
                title: "成功",
                message: "创建成功",
                type: "success",
                duration: 2000
              });
            });
          }
        });
      },
      handlePreviewProductTemplate(row) {
        this.innerTemp1 = Object.assign({}, row); // copy obj
        const tempData = {};
        tempData.product_template_id = this.innerTemp1.id;
        previewProductTemplate(tempData).then(response => {
          this.previewContent = response.data.template_code;
          this.previewTitle = response.data.template_name + " --预览";
          this.previewDialogVisible = true;
        });
      },
      handlePreviewClose() {
        this.previewContent = "";
        this.previewTitle = "";
      },
      handleInnerUpdate1(row) {
        this.innerTemp1 = Object.assign({}, row); // copy obj
        const tempData = {};
        tempData.product_template_id = this.innerTemp1.id;
        getProductTemplateInfo(tempData).then(response => {
          this.innerTemp1 = response.data;
        });
        this.dialogStatus = "update";
        this.innerDialogFormVisible1 = true;
        this.$nextTick(() => {
          this.$refs["innerDataForm1"].clearValidate();
        });
      },
      updateInnerData1() {
        this.$refs["innerDataForm1"].validate(valid => {
          if (valid) {
            const tempData = Object.assign({}, this.innerTemp1);
            tempData.product_template_id = this.innerTemp1.id;
            updateProductTemplate(tempData).then(res => {
              this.innerTemp1.need_release = 1;
              for (const v of this.innerList1) {
                if (v.id === this.innerTemp1.id) {
                  const index = this.innerList1.indexOf(v);
                  this.innerList1.splice(index, 1, res.data);
                  break;
                }
              }
              this.innerDialogFormVisible1 = false;
              this.$notify({
                title: "成功",
                message: "更新成功",
                type: "success",
                duration: 2000
              });
            });
          }
        });
      },
      releaseProductTemplate(row) {
        this.innerTemp1 = Object.assign({}, row);
        const tempData = {};
        tempData.product_template_id = this.innerTemp1.id;
        releaseProductTemplate(tempData).then(() => {
          this.innerTemp1.need_release = 0;
          for (const v of this.innerList1) {
            if (v.id === this.innerTemp1.id) {
              const index = this.innerList1.indexOf(v);
              this.innerList1.splice(index, 1, this.innerTemp1);
              break;
            }
          }
          this.$notify({
            title: "成功",
            message: "发布成功",
            type: "success",
            duration: 2000
          });
        });
      },
      handleInnerDelete1(row) {
        this.$confirm("此操作将永久删除该模板, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(() => {
            const ttempData = {
              product_template_id: row.id
            };
            deleteProductTemplate(ttempData).then(response => {
              this.$notify({
                title: "成功",
                message: "删除成功",
                type: "success",
                duration: 2000
              });
              const index = this.innerList1.indexOf(row);
              this.innerList1.splice(index, 1);
              this.innerTotal1--;
            });
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "已取消删除"
            });
          });
      }
    },
    deactivated() {
      this.scrollTop =
        document.documentElement.scrollTop || document.body.scrollTop;
    },
    activated() {
      window.scrollTo(0, this.scrollTop);
    }
  };
</script>
<style>
  .is-fullscreen .el-dialog__body {
    padding: 30px 0px !important;
  }
</style>
