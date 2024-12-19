import spanish from "./spanish.ts";
import mandarin from "./mandarin.ts";

const runner = async () => {
  await spanish();
  await mandarin();
};

runner();
