import { getConfigDirectory } from './io';

const path = `/some/path/the/user/specified`;

describe('getConfigDirectory', () => {
  beforeAll(() => {
    // eslint-disable-next-line fp/no-mutation
    process.env.CHECKLISTS_DIR = '';
  });

  it('Returns the default directory', () => {
    expect(getConfigDirectory()).toBe(`${process.env.HOME}/.checklists`);
  });

  describe('With the CHECKLISTS_DIR env variable set', () => {
    beforeAll(() => {
      // eslint-disable-next-line fp/no-mutation
      process.env.CHECKLISTS_DIR = path;
    });

    it('Returns the specified directory', () => {
      expect(getConfigDirectory()).toBe(path);
    });
  });
});
