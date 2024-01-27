import {
  readdirSync,
  statSync,
  readFileSync,
  mkdirSync,
  existsSync,
  writeFileSync,
  exists,
} from "fs";

const EMITTED_VUE_PATH = "./vue";

function walkSync(dir: string, filelist: string[] = []) {
  // add trailing slash if not present
  if (dir[dir.length - 1] != "/") dir += "/";
  for (const file of readdirSync(dir)) {
    if (statSync(dir + file).isDirectory())
      // read directories inside directories recursively
      filelist = walkSync(dir + file + "/", filelist);
    else filelist.push(dir + file);
  }
  return filelist;
}

function jsToVue(originalContents: string): string {
  const [top, middleBottom] = originalContents.split("template: `");
  const [middle, ...bottom] = middleBottom.split("`,");
  const out = `<template>${middle}</template>\n\n<script>\n${top}${bottom.join("`,")}</script>`;
  return out;
}

function fixPath(path: string): string {
  const out = path.replace("./pages", EMITTED_VUE_PATH).replace(".js", ".vue");
  const dir = out.split("/").slice(0, -1).join("/");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return out;
}

const paths = walkSync("./pages").filter((v) => v.endsWith("js"));
if (!existsSync(EMITTED_VUE_PATH)) mkdirSync(EMITTED_VUE_PATH);

for (const path of paths) {
  const originalContents = readFileSync(path, { encoding: "utf8" });
  const out = jsToVue(originalContents);
  writeFileSync(fixPath(path), out);
}
