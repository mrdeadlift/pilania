import type { Exercise } from "@/types";
import hundredPoses from "./poses/hundred.json";
import rollupPoses from "./poses/rollup.json";
import singleLegStretchPoses from "./poses/single-leg-stretch.json";

export const exercises: Exercise[] = [
  {
    id: "hundred",
    name: "The Hundred",
    nameJa: "ハンドレッド",
    category: "basic",
    targetMuscles: ["core", "abdominals", "hip flexors"],
    duration: 30,
    description:
      "A fundamental Pilates exercise that builds core strength and stamina. Lie on your back with legs in tabletop position, lift your head and shoulders off the mat, and pump your arms vigorously while breathing rhythmically.",
    descriptionJa:
      "ピラティスの基本エクササイズで、体幹の強さとスタミナを養います。仰向けになり、脚をテーブルトップポジションにし、頭と肩をマットから持ち上げ、リズミカルな呼吸をしながら腕を力強くパンピングします。",
    tips: [
      "Keep your core engaged and lower back pressed to the mat",
      "Breathe in for 5 counts and out for 5 counts while pumping arms",
      "If neck strains, lower your head and continue with legs only",
    ],
    tipsJa: [
      "体幹を引き締め、腰をマットに押し付けたままにする",
      "腕をパンピングしながら5カウントで息を吸い、5カウントで吐く",
      "首が疲れたら頭を下ろし、脚のみで続ける",
    ],
    referencePoses: hundredPoses,
    thumbnail: "/exercises/hundred.svg",
  },
  {
    id: "rollup",
    name: "Roll Up",
    nameJa: "ロールアップ",
    category: "intermediate",
    targetMuscles: ["core", "abdominals", "spine"],
    duration: 30,
    description:
      "A challenging exercise that strengthens the entire abdominal wall while improving spinal articulation. Start lying flat, reach arms overhead, then slowly roll up vertebra by vertebra to a seated position, then reverse the movement with control.",
    descriptionJa:
      "腹筋全体を強化しながら脊椎の可動性を向上させるチャレンジングなエクササイズ。仰向けで腕を頭上に伸ばした状態から始め、背骨を一つ一つ持ち上げるようにゆっくりと座位まで起き上がり、コントロールしながら逆の動きで戻ります。",
    tips: [
      "Engage your core before initiating the movement",
      "Think of peeling your spine off the mat one vertebra at a time",
      "Use your breath to facilitate the movement - exhale as you roll up",
      "Keep your feet grounded and legs straight throughout",
    ],
    tipsJa: [
      "動作を開始する前に体幹を引き締める",
      "背骨を一つ一つマットから剥がすイメージで動く",
      "呼吸を使って動きを促進する - 起き上がる時に息を吐く",
      "足を床につけ、脚を伸ばしたまま保つ",
    ],
    referencePoses: rollupPoses,
    thumbnail: "/exercises/rollup.svg",
  },
  {
    id: "single-leg-stretch",
    name: "Single Leg Stretch",
    nameJa: "シングルレッグストレッチ",
    category: "basic",
    targetMuscles: ["core", "abdominals", "hip flexors", "obliques"],
    duration: 30,
    description:
      "A dynamic core exercise that coordinates breathing with movement. Lie on your back with head lifted, alternate bringing one knee to chest while extending the other leg forward, maintaining a stable torso throughout the movement.",
    descriptionJa:
      "呼吸と動きを調和させるダイナミックな体幹エクササイズ。仰向けで頭を持ち上げた状態で、片膝を胸に引き寄せながらもう一方の脚を前方に伸ばし、交互に行います。動作中は胴体を安定させたまま保ちます。",
    tips: [
      "Keep your lower back pressed firmly into the mat",
      "Extend the straight leg at a 45-degree angle or lower for more challenge",
      "Use your hands to gently pull the bent knee toward your chest",
      "Maintain steady head and shoulder position throughout",
      "Coordinate your breathing - exhale with each leg switch",
    ],
    tipsJa: [
      "腰をマットにしっかりと押し付けたまま保つ",
      "伸ばした脚は45度の角度、またはより低い位置でチャレンジする",
      "両手で曲げた膝を優しく胸に引き寄せる",
      "頭と肩の位置を動作中一定に保つ",
      "呼吸を調整する - 脚を切り替えるたびに息を吐く",
    ],
    referencePoses: singleLegStretchPoses,
    thumbnail: "/exercises/single-leg-stretch.svg",
  },
];

export function getExerciseById(id: string): Exercise | undefined {
  return exercises.find((e) => e.id === id);
}
