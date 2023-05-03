import minimist from "minimist";
import {
  downloadDir,
  limit,
  max_retry,
  odin_tt as odin_tt_config,
  passport_csrf_token as passport_csrf_token_config,
  type,
  user,
} from "../config/config.json";
import type { BinArgvType } from "../type";
import { downloadVideoQueue } from "./download";
import { loadQueue } from "./loadQueue";

(async () => {
  const argv = minimist<BinArgvType>(process.argv.slice(2));
  const {
    u = user,
    t = type,
    l = limit,
    r = max_retry,
    odin_tt = odin_tt_config,
    passport_csrf_token = passport_csrf_token_config,
    dir = downloadDir,
  } = argv;

  if (!u) {
    console.log("未指定 user 参数");
    process.exit();
  }

  const { spiderQueue } = await loadQueue(
    u,
    t,
    l,
    r,
    odin_tt,
    passport_csrf_token
  );
  await downloadVideoQueue(spiderQueue, type, dir);
})();
