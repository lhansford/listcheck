import inquirer from 'inquirer';
import chalk from 'chalk';

import { ChecklistResponse, IChecklist, IChecklistItem } from './interfaces';
import { writeChecklist, readAllChecklists } from './io';
import { logChecklistItemAnswered, logChecklistStarted, logChecklistFinished } from './logging';
import { VERSION } from './constants';

function checklistItemToQuestion(runId: string, item: IChecklistItem): {} {
  return {
    type: 'list',
    name: item.key,
    message: item.label,
    choices: [chalk.green('✔'), chalk.red('✖')],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filter: (input: any) => logChecklistItemAnswered(runId, item.key, input),
  };
}

export async function startChecklist(checklist: IChecklist): Promise<unknown> {
  // eslint-disable-next-line no-magic-numbers
  const runId = Math.random().toString(36).substring(7);
  logChecklistStarted(runId, checklist);
  return inquirer
    .prompt(checklist.items.map((item) => checklistItemToQuestion(runId, item)))
    .then(() => logChecklistFinished(runId))
    .catch(console.error);
}

async function createChecklistItem(): Promise<IChecklistItem | null> {
  return inquirer
    .prompt([
      {
        type: 'string',
        name: 'item',
        message: 'Enter a checklist item name or enter an empty name to complete the checklist:',
      },
    ])
    .then(({ item }) =>
      item && item.length
        ? {
            label: item,
            // eslint-disable-next-line no-magic-numbers
            key: Math.random().toString(36).substring(2, 15),
          }
        : null,
    );
}

async function createChecklistItems(currentList: IChecklistItem[] = []): Promise<IChecklistItem[]> {
  const nextItem = await createChecklistItem();
  if (!nextItem) {
    if (currentList.length === 0) {
      // If no items just keep trying to add.
      return createChecklistItems();
    }
    return currentList;
  }
  return createChecklistItems([...currentList, nextItem]);
}

export async function createChecklist(): Promise<void> {
  return inquirer
    .prompt([
      {
        type: 'string',
        name: 'name',
        message: 'What is the name of your list? (alphanumeric chars only):',
        validate: (value: string): boolean | string => {
          const checklists = readAllChecklists();
          if (checklists.some((c) => c.name === value)) {
            return 'A checklist with this name already exists';
          }
          return value.length > 0 && !!value.match(/^[0-9a-z]+$/);
        },
      },
    ])
    .then(async ({ name }) => {
      const checklist: IChecklist = { name, version: VERSION, items: await createChecklistItems() };
      writeChecklist(checklist);
    });
}

export function listChecklists(): void {
  const checklists = readAllChecklists();
  console.log(checklists.map((c) => c.name).join('\n'));
}

export async function getChecklistFromList(): Promise<IChecklist | ChecklistResponse> {
  const checklists = readAllChecklists();
  const choices = checklists.map((c) => c.name);
  if (!choices.length) {
    return Promise.resolve(ChecklistResponse.NO_CHECKLISTS);
  }
  return inquirer
    .prompt([
      {
        type: 'list',
        name: 'checklistName',
        message: 'Select a checklist',
        choices,
      },
    ])
    .then(
      async ({ checklistName }) =>
        checklists.find((c) => c.name === checklistName) || ChecklistResponse.NOT_FOUND,
    );
}
