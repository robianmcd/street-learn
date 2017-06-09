import { StreetLearnPage } from './app.po';

describe('street-learn App', () => {
  let page: StreetLearnPage;

  beforeEach(() => {
    page = new StreetLearnPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
