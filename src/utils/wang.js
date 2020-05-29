import E from 'wangeditor'

function PrefixInteger(num, n) {
  return (Array(n).join(0) + num).slice(-n)
}
const wangeditormenus = [
  // 'emoticon', // 表情
  'head', // 标题
  'bold', // 粗体
  'fontSize', // 字号
  'fontName', // 字体
  'italic', // 斜体
  'underline', // 下划线
  'strikeThrough', // 删除线
  'foreColor', // 文字颜色
  'backColor', // 背景颜色
  // 'list', // 列表
  'justify', // 对齐方式
  // 'quote', // 引用
  // 'table', // 表格
  // 'video',  // 插入视频
  // 'code',  // 插入代码
  'undo', // 撤销
  'redo' // 重复
]

const Emojibox = [
  {
    title: 'QQ', // tab 的标题
    type: 'image', // type -> 'emoji' / 'image'
    content: [] // content -> 数组
  },
  {
    title: 'Emoji',
    type: 'image',
    content: []
  },
  {
    title: '符号',
    type: 'image',
    content: []
  }
]
const emoji_symbol = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '💢', '♨', '💯', '🌀', '〽', '❗', '❓', '‼', '⁉', '⚜', '💠', '📣', '📢', '🖥', '💻', '⌨', '🖨', '📱', '📲', '⏰', '⏲', '⏳', '⌛', '📩', '💌', '🛍', '📦', '📈', '📉', '📊', '🚚', '🚅', '🚄', '🚥', '🚨', '🚦', '🏃‍♀️', '🚶‍♀️', '💃', '⛳', '🎀', '💞', '💓', '💗', '💖', '💝', '🎊', '🍻', '🍭', '🌷', '🌸', '💐', '🍃', '🌾', '🍂', '🍁', '🌲', '🌳', '🌿', '💥', '🔥', '❄', '☃', '🌨', '💧', '👫', '🇨🇳', '🚩']
const emojiFear = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '☺️', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤓', '😎', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '😢', '😭', '😤', '😠', '😡', '😳', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '😴', '🤤', '😪', '😵', '🤐', '🤢', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '👐', '🙌', '👏', '🤝', '👍', '👎', '👊', '✊️', '🤛', '🤜', '🤞', '✌️', '🤘', '👌', '👈', '👉', '👆', '👇', '☝️', '✋️', '🤚', '🖐', '🖖', '👋', '🤙', '💪', '🖕', '✍️', '🙏', '💍', '💄', '💋', '👄', '👅', '👂', '👃', '👣', '👁', '❤️', '💔', '💘', '✨',
  '🌟', '❕', '❔', '💤', '💦', '🎵', '🔥', '💩', '💏', '💑', '👦', '👧', '👨', '👩', '👼', '💀', '👄', '☀', '☔', '☁', '⛄', '🌙', '⚡', '🌊', '🐱', '🐶', '🐭', '🐹', '🐰', '🐺', '🐸', '🐯', '🐨', '🐻', '🐷', '🐮', '🐗', '🐵', '🐴', '🐍', '🐦', '🐔', '🐧', '🐛', '🐙', '🐠', '🐳', '🌹', '🌺', '🌴', '🌵', '💝', '🎃', '👻', '🎅🏻', '🎄', '🎁', '🔔', '🎉', '🎈', '💿', '📷', '🎥', '💻', '📺', '☎', '🔓', '🔒', '🔑', '💡', '📬', '🛀', '💰', '💣', '💊', '🏆', '👾', '🎤', '🎸', '👙', '👑', '🌂', '👜', '💄', '💍', '💎', '☕', '🍺', '🍻', '🍸', '🍔', '🍟', '🍝', '🍣', '🍜', '🍳', '🍦', '🎂', '🍎', '✈', '🚀', '🚲', '🚅', '⚠', '🏁', '🚹', '🚺', '⭕', '❌', '©', '®', '™']
const qqFear = ['[微笑]', '[撇嘴]', '[色]', '[发呆]', '[得意]', '[流泪]', '[害羞]', '[闭嘴]', '[睡]', '[大哭]', '[尴尬]', '[发怒]', '[调皮]', '[呲牙]', '[惊讶]', '[难过]', '[酷]', '[冷汗]', '[抓狂]', '[吐]', '[偷笑]', '[愉快]', '[白眼]', '[傲慢]', '[饥饿]', '[困]', '[惊恐]', '[流汗]', '[憨笑]', '[悠闲]', '[奋斗]', '[咒骂]', '[疑问]', '[嘘]', '[晕]', '[疯了]', '[哀]', '[骷髅]', '[敲打]', '[再见]', '[擦汗]', '[抠鼻]', '[鼓掌]', '[糗大了]', '[坏笑]', '[左哼哼]', '[右哼哼]', '[哈欠]', '[鄙视]', '[委屈]', '[快哭了]', '[阴险]', '[亲亲]', '[吓]', '[可怜]', '[菜刀]', '[西瓜]', '[啤酒]', '[篮球]', '[乒乓]', '[咖啡]', '[饭]', '[猪头]', '[玫瑰]', '[凋谢]', '[嘴唇]', '[爱心]', '[心碎]', '[蛋糕]', '[闪电]', '[炸弹]', '[刀]', '[足球]', '[瓢虫]', '[便便]', '[月亮]', '[太阳]', '[礼物]', '[拥抱]', '[强]', '[弱]', '[握手]', '[胜利]', '[抱拳]', '[勾引]', '[拳头]', '[差劲]', '[爱你]',
  '[NO]', '[OK]', '[爱情]', '[飞吻]', '[跳跳]', '[发抖]', '[怄火]', '[转圈]', '[磕头]', '[回头]', '[跳绳]', '[投降]', '[激动]', '[乱舞]', '[献吻]', '[左太极]', '[右太极]', '[嘿哈]', '[捂脸]', '[奸笑]', '[皱眉]', '[耶]', '[红包]', '[蜡烛]']

for (let v = 0; v < emojiFear.length; v++) {
  const parm = {
    src: require('../assets/customFace/emoji/' + PrefixInteger(v + 1, 4) + '.png'),
    alt: emojiFear[v]
  }
  Emojibox[1].content.push(parm)
}
for (const v in qqFear) {
  const parm = {
    src: require('../assets/customFace/qq/' + v + '.png'),
    alt: qqFear[v]
  }
  Emojibox[0].content.push(parm)
}
for (let v = 0; v < emoji_symbol.length; v++) {
  const parm = {
    src: require('../assets/customFace/symbol/' + PrefixInteger(v + 1, 4) + '.png'),
    alt: emoji_symbol[v]
  }
  Emojibox[2].content.push(parm)
}

export function wangEditor(parm, fun) {
  const editor = new E(parm)
  editor.customConfig.menus = wangeditormenus
  editor.customConfig.emotions = Emojibox
  editor.customConfig.linkImgCallback = function(url) {
  }
  if (fun) {
    editor.customConfig.onchange = fun
  }
  editor.customConfig.pasteTextHandle = (content) => {
    content = content.replace(/(\n)/g, '')
    content = content.replace(/(\t)/g, '')
    content = content.replace(/(\r)/g, '')
    content = content.replace(/<\/?[^>]*>/g, '')
    content = content.replace(/\s*/g, '')
    return content
  }
  // editor.customConfig.uploadImgServer = '/upload'
  editor.customConfig.pasteIgnoreImg = true
  editor.customConfig.uploadImgShowBase64 = true // 图片样式
  editor.customConfig.Colors = [
    '#000000',
    '#eeece0',
    '#1c487f',
    '#4d80bf',
    '#c24f4a',
    '#8baa4a',
    '#7b5ba1',
    '#46acc8',
    '#f9963b',
    '#ffffff'
  ]
  return editor
}
