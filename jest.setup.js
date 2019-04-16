const DATE_TO_USE = new Date(1554477808049);
const _Date = Date;

global.Date = jest.fn(() => DATE_TO_USE);
global.Date.UTC = _Date.UTC;
global.Date.parse = _Date.parse;
global.Date.now = _Date.now;
global.Date.getTime = _Date.getTime