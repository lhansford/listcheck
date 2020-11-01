import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';

import { ChecklistResponse, IChecklist, ILog } from './interfaces';
import { VERSION } from './constants';

const DEFAULT_CONFIG_DIR = `${process.env.HOME}/.checklists`;
const CONFIG_DIR_ENV = 'CHECKLISTS_DIR';

export function getConfigDirectory(): string {
  const dir = process.env[CONFIG_DIR_ENV] || DEFAULT_CONFIG_DIR;
  if (process.env.NODE_ENV !== 'test' && !existsSync(dir)) {
    mkdirSync(dir);
  }
  return dir;
}

const getLogPath = (): string => `${getConfigDirectory()}/logs/log.json`;

function readFile(path: string): IChecklist | null {
  const data = readFileSync(path);
  // TODO: verify format
  return JSON.parse(data.toString());
}

export function readChecklist(id: string): IChecklist | ChecklistResponse {
  const file = readFile(`${getConfigDirectory()}/${id}.json`);
  return file || ChecklistResponse.NOT_FOUND;
}

export function writeChecklist(checklist: IChecklist): void {
  writeFileSync(`${getConfigDirectory()}/${checklist.name}.json`, JSON.stringify(checklist), {
    encoding: 'utf8',
    flag: 'w',
  });
}

export function readAllChecklists(): IChecklist[] {
  const configDir = getConfigDirectory();
  const paths = readdirSync(configDir)
    .map((fileName) => `${configDir}/${fileName}`)
    .filter((filename) => filename.endsWith('.json'));
  return paths.map(readFile).filter((i) => i !== null) as IChecklist[];
}

export function writeLog(log: ILog): void {
  writeFileSync(getLogPath(), JSON.stringify(log), {
    encoding: 'utf8',
    flag: 'w',
  });
}

export function readLog(): ILog {
  if (!existsSync(getLogPath())) {
    writeLog({ version: VERSION, entries: [] });
  }
  const data = readFileSync(getLogPath());
  // TODO: verify format
  return JSON.parse(data.toString());
}
