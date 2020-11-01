#!/usr/bin/env node
import { program } from 'commander';
import chalk from 'chalk';

import { readChecklist } from './io';
import { startChecklist, createChecklist, listChecklists, getChecklistFromList } from './checklist';

import { version } from '../package.json';
import { ChecklistResponse } from './interfaces';

program.version(version);

program.command('add').description('Adds a new checklist').action(createChecklist);
program.command('list').description('Lists the existing checklists').action(listChecklists);

program
  .command('start [listName]', { isDefault: true })
  .description('Runs a checklist. Append the name of the checklist to run a specific checklist.')
  .action((checklistName?: string) => {
    const checklistPromise = checklistName
      ? Promise.resolve(readChecklist(checklistName))
      : getChecklistFromList();

    checklistPromise
      .then((checklist) => {
        if (checklist === ChecklistResponse.NOT_FOUND) {
          throw Error(`Could not find checklist ${checklistName}`);
        } else if (checklist === ChecklistResponse.NO_CHECKLISTS) {
          console.log(
            chalk.yellow('No checklists available. Run `listcheck add` to create a new checklist.'),
          );
        } else if (checklist) {
          startChecklist(checklist).catch(console.error);
        }
      })
      .catch(console.error);
  });

program.parse(process.argv);
