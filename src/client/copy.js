export const interfaceCopy = new Map([
  ["Photo Date Albums", "照片日期相册"],
  ["New album", "新建相册"],
  ["Add photos", "添加照片"],
  ["Sign in", "登录"],
  ["Sign out", "退出"],
  ["Create", "创建"],
  ["Delete", "删除"],
  ["Cancel", "取消"],
  ["Done", "完成"],
  ["Close", "关闭"],
  ["More", "更多"],
  ["Dark appearance", "深色外观"],
  ["Light appearance", "浅色外观"],
  ["All albums", "全部相册"],
  ["Add pictures", "添加照片"],
  ["Picture actions", "照片操作"],
  ["Mark picture public", "公开这张照片"],
  ["Add to album", "加入相册"],
  ["Back", "返回"],
  ["Already added", "已加入"],
  ["Add picture", "添加这张照片"],
  ["Private", "私密"],
  ["Public", "公开"],
  ["Mark album public", "将相册设为公开"],
  ["Make album private", "将相册设为私密"],
  ["Assigned", "指定日期"],
  ["Albums", "相册"],
  ["Name", "姓名"],
  ["Secret", "密码"],
  ["Create account", "创建账号"],
  ["Create an account", "创建账号"],
  ["Sign in instead", "改为登录"],
  ["Could not sign in.", "登录失败。"],
  ["An account with that name already exists.", "已有同名账号。"],
  ["Enter an account name and a secret.", "请输入姓名和密码。"],
  ["Account created. Sign in to continue.", "账号已创建。请登录。"],
  [
    "Enter an album name of 1 to 64 characters.",
    "请输入 1 到 64 个字符的相册名。",
  ],
  ["An album with that name already exists.", "已有同名相册。"],
  ["There are no public photos.", "没有公开的照片。"],
  [
    "Add photos to organize them by the day they were taken.",
    "添加照片，按拍摄日期整理。",
  ],
  [
    "No named albums yet. Use New album to make one.",
    "还没有命名相册。使用「新建相册」创建一个。",
  ],
  ["This album has no pictures.", "此相册没有照片。"],
  ["No pictures to add.", "没有可添加的照片。"],
  ["This picture cannot be shown.", "这张照片无法显示。"],
  ["Delete this picture?", "删除这张照片？"],
  ["It will be removed from every album.", "它会从所有相册中移除。"],
  ["Could not delete the picture.", "无法删除这张照片。"],
  ["1 item was skipped.", "已跳过 1 项。"],
  ["This picture is already in the library.", "这张照片已在库中。"],
  ["Could not store the photo.", "无法保存这张照片。"],
  ["Sign in to continue.", "请先登录。"],
  ["Album created.", "相册已创建。"],
  ["Picture deleted.", "照片已删除。"],
  ["Album is now public.", "相册已公开。"],
  ["Album is now private.", "相册已设为私密。"],
]);

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function text(language, sentence) {
  if (language !== "zh") return sentence;
  const known = interfaceCopy.get(sentence);
  if (known) return known;
  const skipped = /^(\d+) items were skipped\.$/.exec(sentence);
  if (skipped) return `已跳过 ${skipped[1]} 项。`;
  return sentence;
}

export function monthHeading(language, year, month) {
  if (language === "zh") return `${year}年${month}月`;
  return `${months[month - 1]} ${year}`;
}
