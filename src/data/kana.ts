import type { KanaItem, KanaType } from "../types/learning";

type KanaSeed = {
  romaji: string;
  row: string;
  column: string;
  hiragana: string;
  katakana: string;
  pronunciationTip: string;
  chineseHint: string;
  exampleWord: string;
  exampleReading: string;
  exampleMeaning: string;
};

const kanaSeeds: KanaSeed[] = [
  { romaji: "a", row: "あ行", column: "あ段", hiragana: "あ", katakana: "ア", pronunciationTip: "嘴巴自然张开，发短促的 a。", chineseHint: "接近“啊”，但更短。", exampleWord: "あめ", exampleReading: "ame", exampleMeaning: "雨" },
  { romaji: "i", row: "あ行", column: "い段", hiragana: "い", katakana: "イ", pronunciationTip: "嘴角稍微向两边拉，声音短。", chineseHint: "接近“一”。", exampleWord: "いぬ", exampleReading: "inu", exampleMeaning: "狗" },
  { romaji: "u", row: "あ行", column: "う段", hiragana: "う", katakana: "ウ", pronunciationTip: "嘴唇不要太圆，轻轻发 u。", chineseHint: "介于“乌”和“呜”之间。", exampleWord: "うみ", exampleReading: "umi", exampleMeaning: "海" },
  { romaji: "e", row: "あ行", column: "え段", hiragana: "え", katakana: "エ", pronunciationTip: "嘴巴半开，发 e。", chineseHint: "接近“诶”。", exampleWord: "えき", exampleReading: "eki", exampleMeaning: "车站" },
  { romaji: "o", row: "あ行", column: "お段", hiragana: "お", katakana: "オ", pronunciationTip: "嘴巴略圆，发短 o。", chineseHint: "接近“哦”。", exampleWord: "おかね", exampleReading: "okane", exampleMeaning: "钱" },
  { romaji: "ka", row: "か行", column: "あ段", hiragana: "か", katakana: "カ", pronunciationTip: "k 加 a，轻快发音。", chineseHint: "接近“卡”。", exampleWord: "かさ", exampleReading: "kasa", exampleMeaning: "伞" },
  { romaji: "ki", row: "か行", column: "い段", hiragana: "き", katakana: "キ", pronunciationTip: "k 加 i。", chineseHint: "接近“ki”。", exampleWord: "きた", exampleReading: "kita", exampleMeaning: "北方" },
  { romaji: "ku", row: "か行", column: "う段", hiragana: "く", katakana: "ク", pronunciationTip: "k 加 u。", chineseHint: "接近“哭”的轻声。", exampleWord: "くに", exampleReading: "kuni", exampleMeaning: "国家" },
  { romaji: "ke", row: "か行", column: "え段", hiragana: "け", katakana: "ケ", pronunciationTip: "k 加 e。", chineseHint: "接近“开”的前半。", exampleWord: "けさ", exampleReading: "kesa", exampleMeaning: "今天早上" },
  { romaji: "ko", row: "か行", column: "お段", hiragana: "こ", katakana: "コ", pronunciationTip: "k 加 o。", chineseHint: "接近“阔”的短音。", exampleWord: "こえ", exampleReading: "koe", exampleMeaning: "声音" },
  { romaji: "sa", row: "さ行", column: "あ段", hiragana: "さ", katakana: "サ", pronunciationTip: "s 加 a，气流清楚。", chineseHint: "接近“撒”。", exampleWord: "さけ", exampleReading: "sake", exampleMeaning: "酒" },
  { romaji: "shi", row: "さ行", column: "い段", hiragana: "し", katakana: "シ", pronunciationTip: "不是 si，舌面靠近上颚。", chineseHint: "接近“西”。", exampleWord: "しお", exampleReading: "shio", exampleMeaning: "盐" },
  { romaji: "su", row: "さ行", column: "う段", hiragana: "す", katakana: "ス", pronunciationTip: "s 加轻 u，词尾常弱化。", chineseHint: "接近“丝”的短促音。", exampleWord: "すし", exampleReading: "sushi", exampleMeaning: "寿司" },
  { romaji: "se", row: "さ行", column: "え段", hiragana: "せ", katakana: "セ", pronunciationTip: "s 加 e。", chineseHint: "接近“塞”的前半。", exampleWord: "せき", exampleReading: "seki", exampleMeaning: "座位" },
  { romaji: "so", row: "さ行", column: "お段", hiragana: "そ", katakana: "ソ", pronunciationTip: "s 加 o。", chineseHint: "接近“嗦”的短音。", exampleWord: "そら", exampleReading: "sora", exampleMeaning: "天空" },
  { romaji: "ta", row: "た行", column: "あ段", hiragana: "た", katakana: "タ", pronunciationTip: "t 加 a。", chineseHint: "接近“他”。", exampleWord: "たこ", exampleReading: "tako", exampleMeaning: "章鱼" },
  { romaji: "chi", row: "た行", column: "い段", hiragana: "ち", katakana: "チ", pronunciationTip: "不是 ti，接近 chi。", chineseHint: "接近“七”。", exampleWord: "ちかてつ", exampleReading: "chikatetsu", exampleMeaning: "地铁" },
  { romaji: "tsu", row: "た行", column: "う段", hiragana: "つ", katakana: "ツ", pronunciationTip: "舌尖轻触后放开，发 tsu。", chineseHint: "接近“刺”的前半。", exampleWord: "つき", exampleReading: "tsuki", exampleMeaning: "月亮" },
  { romaji: "te", row: "た行", column: "え段", hiragana: "て", katakana: "テ", pronunciationTip: "t 加 e。", chineseHint: "接近“忒”。", exampleWord: "て", exampleReading: "te", exampleMeaning: "手" },
  { romaji: "to", row: "た行", column: "お段", hiragana: "と", katakana: "ト", pronunciationTip: "t 加 o。", chineseHint: "接近“托”。", exampleWord: "とり", exampleReading: "tori", exampleMeaning: "鸟" },
  { romaji: "na", row: "な行", column: "あ段", hiragana: "な", katakana: "ナ", pronunciationTip: "n 加 a。", chineseHint: "接近“那”。", exampleWord: "なつ", exampleReading: "natsu", exampleMeaning: "夏天" },
  { romaji: "ni", row: "な行", column: "い段", hiragana: "に", katakana: "ニ", pronunciationTip: "n 加 i。", chineseHint: "接近“你”。", exampleWord: "にく", exampleReading: "niku", exampleMeaning: "肉" },
  { romaji: "nu", row: "な行", column: "う段", hiragana: "ぬ", katakana: "ヌ", pronunciationTip: "n 加 u。", chineseHint: "接近“努”。", exampleWord: "ぬの", exampleReading: "nuno", exampleMeaning: "布" },
  { romaji: "ne", row: "な行", column: "え段", hiragana: "ね", katakana: "ネ", pronunciationTip: "n 加 e。", chineseHint: "接近“内”。", exampleWord: "ねこ", exampleReading: "neko", exampleMeaning: "猫" },
  { romaji: "no", row: "な行", column: "お段", hiragana: "の", katakana: "ノ", pronunciationTip: "n 加 o。", chineseHint: "接近“诺”。", exampleWord: "のり", exampleReading: "nori", exampleMeaning: "海苔" },
  { romaji: "ha", row: "は行", column: "あ段", hiragana: "は", katakana: "ハ", pronunciationTip: "h 加 a；作助词时常读 wa。", chineseHint: "接近“哈”。", exampleWord: "はな", exampleReading: "hana", exampleMeaning: "花" },
  { romaji: "hi", row: "は行", column: "い段", hiragana: "ひ", katakana: "ヒ", pronunciationTip: "h 加 i，气流轻。", chineseHint: "接近“嘿”的短音。", exampleWord: "ひと", exampleReading: "hito", exampleMeaning: "人" },
  { romaji: "fu", row: "は行", column: "う段", hiragana: "ふ", katakana: "フ", pronunciationTip: "不是 hu，双唇轻轻吹气。", chineseHint: "接近“夫”，但气更轻。", exampleWord: "ふゆ", exampleReading: "fuyu", exampleMeaning: "冬天" },
  { romaji: "he", row: "は行", column: "え段", hiragana: "へ", katakana: "ヘ", pronunciationTip: "h 加 e；作方向助词时读 e。", chineseHint: "接近“嘿”。", exampleWord: "へや", exampleReading: "heya", exampleMeaning: "房间" },
  { romaji: "ho", row: "は行", column: "お段", hiragana: "ほ", katakana: "ホ", pronunciationTip: "h 加 o。", chineseHint: "接近“吼”的短音。", exampleWord: "ほん", exampleReading: "hon", exampleMeaning: "书" },
  { romaji: "ma", row: "ま行", column: "あ段", hiragana: "ま", katakana: "マ", pronunciationTip: "m 加 a。", chineseHint: "接近“妈”。", exampleWord: "まち", exampleReading: "machi", exampleMeaning: "街道" },
  { romaji: "mi", row: "ま行", column: "い段", hiragana: "み", katakana: "ミ", pronunciationTip: "m 加 i。", chineseHint: "接近“米”。", exampleWord: "みみ", exampleReading: "mimi", exampleMeaning: "耳朵" },
  { romaji: "mu", row: "ま行", column: "う段", hiragana: "む", katakana: "ム", pronunciationTip: "m 加 u。", chineseHint: "接近“木”。", exampleWord: "むし", exampleReading: "mushi", exampleMeaning: "虫" },
  { romaji: "me", row: "ま行", column: "え段", hiragana: "め", katakana: "メ", pronunciationTip: "m 加 e。", chineseHint: "接近“妹”的短音。", exampleWord: "め", exampleReading: "me", exampleMeaning: "眼睛" },
  { romaji: "mo", row: "ま行", column: "お段", hiragana: "も", katakana: "モ", pronunciationTip: "m 加 o。", chineseHint: "接近“摸”。", exampleWord: "もも", exampleReading: "momo", exampleMeaning: "桃子" },
  { romaji: "ya", row: "や行", column: "あ段", hiragana: "や", katakana: "ヤ", pronunciationTip: "y 加 a。", chineseHint: "接近“呀”。", exampleWord: "やま", exampleReading: "yama", exampleMeaning: "山" },
  { romaji: "yu", row: "や行", column: "う段", hiragana: "ゆ", katakana: "ユ", pronunciationTip: "y 加 u。", chineseHint: "接近“由”。", exampleWord: "ゆき", exampleReading: "yuki", exampleMeaning: "雪" },
  { romaji: "yo", row: "や行", column: "お段", hiragana: "よ", katakana: "ヨ", pronunciationTip: "y 加 o。", chineseHint: "接近“哟”。", exampleWord: "よる", exampleReading: "yoru", exampleMeaning: "夜晚" },
  { romaji: "ra", row: "ら行", column: "あ段", hiragana: "ら", katakana: "ラ", pronunciationTip: "舌尖轻弹，介于 l 和 r。", chineseHint: "接近“啦”，但舌头轻弹。", exampleWord: "らいねん", exampleReading: "rainen", exampleMeaning: "明年" },
  { romaji: "ri", row: "ら行", column: "い段", hiragana: "り", katakana: "リ", pronunciationTip: "轻弹舌尖后接 i。", chineseHint: "接近“里”。", exampleWord: "りんご", exampleReading: "ringo", exampleMeaning: "苹果" },
  { romaji: "ru", row: "ら行", column: "う段", hiragana: "る", katakana: "ル", pronunciationTip: "轻弹舌尖后接 u。", chineseHint: "接近“路”。", exampleWord: "るす", exampleReading: "rusu", exampleMeaning: "不在家" },
  { romaji: "re", row: "ら行", column: "え段", hiragana: "れ", katakana: "レ", pronunciationTip: "轻弹舌尖后接 e。", chineseHint: "接近“勒”。", exampleWord: "れい", exampleReading: "rei", exampleMeaning: "例子" },
  { romaji: "ro", row: "ら行", column: "お段", hiragana: "ろ", katakana: "ロ", pronunciationTip: "轻弹舌尖后接 o。", chineseHint: "接近“咯”的短音。", exampleWord: "ろく", exampleReading: "roku", exampleMeaning: "六" },
  { romaji: "wa", row: "わ行", column: "あ段", hiragana: "わ", katakana: "ワ", pronunciationTip: "w 加 a。", chineseHint: "接近“哇”。", exampleWord: "わたし", exampleReading: "watashi", exampleMeaning: "我" },
  { romaji: "wo", row: "わ行", column: "お段", hiragana: "を", katakana: "ヲ", pronunciationTip: "现代日语中多作助词，通常读 o。", chineseHint: "接近“哦”。", exampleWord: "ごはんを", exampleReading: "gohan o", exampleMeaning: "把饭..." },
  { romaji: "n", row: "ん", column: "鼻音", hiragana: "ん", katakana: "ン", pronunciationTip: "鼻音，位置会随后面的音变化。", chineseHint: "接近“嗯”。", exampleWord: "ほん", exampleReading: "hon", exampleMeaning: "书" }
];

const toKanaItem = (seed: KanaSeed, type: KanaType): KanaItem => ({
  id: `${type}-${seed.romaji}`,
  type,
  kana: type === "hiragana" ? seed.hiragana : seed.katakana,
  romaji: seed.romaji,
  row: seed.row,
  column: seed.column,
  pronunciationTip: seed.pronunciationTip,
  chineseHint: seed.chineseHint,
  exampleWord:
    type === "hiragana" ? seed.exampleWord : seed.exampleWord.toUpperCase(),
  exampleReading: seed.exampleReading,
  exampleMeaning: seed.exampleMeaning
});

export const kana: KanaItem[] = [
  ...kanaSeeds.map((seed) => toKanaItem(seed, "hiragana")),
  ...kanaSeeds.map((seed) => toKanaItem(seed, "katakana"))
];

export const hiragana = kana.filter((item) => item.type === "hiragana");
export const katakana = kana.filter((item) => item.type === "katakana");
