
'use strict';

var openUrl = require('./helpers/utils').open,
    workspace = require('./helpers/pages').workspace,
    content = require('./helpers/content'),
    authoring = require('./helpers/authoring');

describe('Content', function() {

    var body = element(by.tagName('body'));

    function selectedHeadline() {
        var headline = element(by.className('preview-headline'));

        browser.wait(function() {
            return headline.isDisplayed();
        }, 200); // animated sidebar

        return headline.getText();
    }

    beforeEach(function() {
        openUrl('/#/workspace');
        workspace.switchToDesk('PERSONAL');
        expect(element.all(by.repeater('items._items')).count()).toBe(3);
    });

    // wait a bit after sending keys to body
    function pressKey(key) {
        body.sendKeys(key);
        browser.sleep(50);
    }

    it('can navigate with keyboard', function() {
        pressKey(protractor.Key.UP);
        expect(selectedHeadline()).toBe('package1');

        pressKey(protractor.Key.DOWN);
        expect(selectedHeadline()).toBe('item1');

        pressKey(protractor.Key.RIGHT);
        expect(selectedHeadline()).toBe('item2');

        pressKey(protractor.Key.LEFT);
        expect(selectedHeadline()).toBe('item1');

        pressKey(protractor.Key.UP);
        expect(selectedHeadline()).toBe('package1');
    });

    it('can open search with s', function() {
        pressKey('s');
        expect(element(by.id('search-input')).isDisplayed()).toBe(true);
    });

    it('can toggle view with v', function() {
        var gridBtn = element.all(by.css('.view-select button')).first();

        // reset to grid view first
        gridBtn.isDisplayed().then(function(isList) {
            if (isList) {
                gridBtn.click();
            }
        });

        expect(element.all(by.css('.state-border')).count()).toBe(0);
        body.sendKeys('v');
        expect(element.all(by.css('.state-border')).count()).toBe(3);
        body.sendKeys('v');
        expect(element.all(by.css('.state-border')).count()).toBe(0);
    });

    function toggle(selectbox) {
        browser.actions().mouseMove(selectbox).perform();
        selectbox.element(by.css('.sd-checkbox')).click();
    }

    it('can select multiple items', function() {
        content.setListView();
        var count = element(by.id('multi-select-count')),
            boxes = element.all(by.css('.list-field.type-icon'));

        toggle(boxes.first());
        expect(count.getText()).toBe('1 Item selected');

        toggle(boxes.last());
        expect(count.getText()).toBe('2 Items selected');

        element(by.css('.big-icon-multiedit')).click();
        expect(browser.getCurrentUrl()).toMatch(/multiedit$/);
        expect(element.all(by.repeater('board in boards')).count()).toBe(2);
    });

    it('can create text article in a desk', function() {
        workspace.switchToDesk('SPORTS DESK');
        content.setListView();

        element(by.className('sd-create-btn')).click();
        element(by.id('create_text_article')).click();

        authoring.writeText('Words');
        authoring.save();
        authoring.close();

        expect(content.count()).toBe(3);
    });

    it('can create empty package in a desk', function() {
        workspace.switchToDesk('SPORTS DESK');
        content.setListView();

        element(by.className('sd-create-btn')).click();
        element(by.id('create_package')).click();

        element.all(by.model('item.headline')).first().sendKeys('Empty Package');
        authoring.save();
        authoring.close();

        expect(content.count()).toBe(3);
    });

    it('can close unsaved empty package in a desk', function() {
        workspace.switchToDesk('SPORTS DESK');
        content.setListView();

        element(by.className('sd-create-btn')).click();
        element(by.id('create_package')).click();

        element.all(by.model('item.headline')).first().sendKeys('Empty Package');
        authoring.close();

        element.all(by.className('btn-warning')).first().click();
        expect(content.count()).toBe(2);
    });

    it('can open item using hotkey ctrl+0', function() {
        content.setListView();

        browser.actions().sendKeys(protractor.Key.chord(protractor.Key.CONTROL, '0')).perform();
        browser.sleep(500);

        var storyNameEl = element(by.model('meta.unique_name'));
        expect(storyNameEl.isDisplayed()).toBe(true);

        storyNameEl.clear();
        storyNameEl.sendKeys('item1');

        element(by.id('searchItemByNameBtn')).click();
        browser.sleep(500);

        expect(element(by.className('info-icons')).all(by.className('filetype-icon-text'))
            .first().isDisplayed()).toBe(true);
        expect(element(by.className('navigation-tabs')).all(by.repeater('widget in widgets')).count()).toBe(7);

        element(by.id('closeAuthoringBtn')).click();
    });

    it('can open package using hotkey ctrl+0', function() {
        content.setListView();

        browser.actions().sendKeys(protractor.Key.chord(protractor.Key.CONTROL, '0')).perform();
        browser.sleep(500);

        var storyNameEl = element(by.model('meta.unique_name'));
        expect(storyNameEl.isDisplayed()).toBe(true);

        storyNameEl.clear();
        storyNameEl.sendKeys('package1');

        element(by.id('searchItemByNameBtn')).click();
        browser.sleep(500);

        expect(element(by.className('info-icons')).all(by.className('filetype-icon-composite'))
            .first().isDisplayed()).toBe(true);
        expect(element(by.className('navigation-tabs')).all(by.repeater('widget in widgets')).count()).toBe(6);

        element(by.id('closeAuthoringBtn')).click();
    });

});
