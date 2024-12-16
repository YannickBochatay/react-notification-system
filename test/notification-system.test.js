/**
 * @jest-environment jsdom
 */
import React, { Component } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, test, beforeEach, jest } from "@jest/globals";
import NotificationSystem from '../src/NotificationSystem';
import { positions, levels } from '../src/constants';

const defaultNotification = {
  title: 'This is a title',
  message: 'This is a message',
  level: 'success'
};

const style = {
  Containers: {
    DefaultStyle: {
      width: 600
    },

    tl: {
      width: 800
    }
  }
};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

describe('Notification Component', function() {
  let notificationObj;
  let component;
  const ref = 'notificationSystem';

  jest.setTimeout(10000);

  beforeEach(() => {
    // We need to create this wrapper so we can use refs
    class ElementWrapper extends Component {
      render() {
        return <NotificationSystem ref={ ref } style={ style } allowHTML={ true } noAnimation={ true } />;
      }
    }
    render(React.createElement(ElementWrapper));
    notificationObj = Object.assign({}, defaultNotification);
    component = screen.getAllBy('.notifications-wrapper');
  });

  test('should be rendered', done => {
    expect(component).toBeDefined();
    done();
  });

  test('should render a single notification', done => {
    component.addNotification(defaultNotification);
    const notification = screen.getAllBy('.notification');
    expect(notification.length).toBe(1);
    done();
  });

  test('should not set a notification visibility class when the notification is initially added', done => {
    component.addNotification(defaultNotification);
    const notification = screen.getAllBy('.notification');
    expect(notification.className).not.toMatch(/notification-hidden/);
    expect(notification.className).not.toMatch(/notification-visible/);
    done();
  });

  test('should set the notification class to visible after added', async() => {
    component.addNotification(defaultNotification);
    const notification = screen.getAllBy('.notification');
    expect(notification.className).to.match(/notification/);
    await sleep(400);
    expect(notification.className).toMatch(/notification-visible/);
  });

  test('should add additional classes to the notification if specified', done => {
    component.addNotification(Object.assign({},defaultNotification, {className: 'FOO'}));
    const notification = screen.getAllBy('.notification');
    expect(notification.className).toContain(' FOO');
    done();
  });

  test('should render notifications in all positions with all levels', done => {
    let count = 0;
    for (let position of Object.keys(positions)) {
      for (let level of Object.keys(levels)) {
        notificationObj.position = positions[position];
        notificationObj.level = levels[level];
        component.addNotification(notificationObj);
        count++;
      }
    }

    const containers = [];

    for (let position of Object.keys(positions)) {
      containers.push(screen.getAllBy('.notifications-' + positions[position]));
    }

    containers.forEach(function(container) {
      for (let level of Object.keys(levels)) {
        let notification = container.getElementsByClassName('notification-' + levels[level]);
        expect(notification).toBeDefined();
      }
    });

    const notifications = screen.queryAllBy('.notification');
    expect(notifications.length).toBe(count);
    done();
  });

  test('should render multiple notifications', done => {
    const randomNumber = Math.floor(Math.random(5, 10));

    for (let i = 1; i <= randomNumber; i++) {
      component.addNotification(defaultNotification);
    }

    const notifications = screen.queryAllBy('.notification');
    expect(notifications.length).toBe(randomNumber);
    done();
  });

  test('should not render notifications with the same uid', done => {
    notificationObj.uid = 500;
    component.addNotification(notificationObj);
    component.addNotification(notificationObj);
    const notification = screen.queryAllBy('.notification');
    expect(notification.length).toBe(1);
    done();
  });

  test('should remove a notification after autoDismiss', async () => {
    notificationObj.autoDismiss = 2;
    component.addNotification(notificationObj);
    await sleep(3000);
    const notification = screen.queryAllBy('.notification');
    expect(notification.length).toBe(0);
  });

  test('should remove a notification using returned object', async() => {
    const notificationCreated = component.addNotification(defaultNotification);
    const notification = screen.queryAllBy('.notification');
    expect(notification.length).toBe(1);

    component.removeNotification(notificationCreated);
    await sleep(1000);
    const notificationRemoved = screen.queryAllBy('.notification');
    expect(notificationRemoved.length).toBe(0);
  });

  test('should remove a notification using uid', async() => {
    const notificationCreated = component.addNotification(defaultNotification);
    const notification = screen.queryAllBy('.notification');
    expect(notification.length).toBe(1);

    component.removeNotification(notificationCreated.uid);
    await sleep(200);
    const notificationRemoved = screen.queryAllBy('.notification');
    expect(notificationRemoved.length).toBe(0);
  });

  test('should edit an existing notification using returned object', async() => {
    const notificationCreated = component.addNotification(defaultNotification);
    const notification = screen.queryAllBy('.notification');
    expect(notification.length).toBe(1);

    const newTitle = 'foo';
    const newContent = 'foobar';

    component.editNotification(notificationCreated, { title: newTitle, message: newContent });
    await sleep(1000);
    const notificationEdited = screen.getAllBy('.notification');
    expect(notificationEdited.getElementsByClassName('notification-title')[0].textContent).toBe(newTitle);
    expect(notificationEdited.getElementsByClassName('notification-message')[0].textContent).toBe(newContent);
  });

  test('should edit an existing notification using uid', async() => {
    const notificationCreated = component.addNotification(defaultNotification);
    const notification = screen.queryAllBy('.notification');
    expect(notification.length).toBe(1);

    const newTitle = 'foo';
    const newContent = 'foobar';

    component.editNotification(notificationCreated.uid, { title: newTitle, message: newContent });
    await sleep(1000);
    const notificationEdited = screen.getAllBy('.notification');
    expect(notificationEdited.getElementsByClassName('notification-title')[0].textContent).toBe(newTitle);
    expect(notificationEdited.getElementsByClassName('notification-message')[0].textContent).toBe(newContent);
  });

  test('should remove all notifications', async() => {
    component.addNotification(defaultNotification);
    component.addNotification(defaultNotification);
    component.addNotification(defaultNotification);
    const notification = screen.queryAllBy('.notification');
    expect(notification.length).toBe(3);
    component.clearNotifications();
    await sleep(200);
    const notificationRemoved = screen.queryAllBy('.notification');
    expect(notificationRemoved.length).toBe(0);
  });

  test('should dismiss notification on click', async() => {
    component.addNotification(notificationObj);
    const notification = screen.getAllBy('.notification');
    fireEvent.click(notification);
    await sleep(1000);
    const notificationRemoved = screen.queryAllBy('.notification');
    expect(notificationRemoved.length).toBe(0);
  });

  test('should dismiss notification on click of dismiss button', async() => {
    component.addNotification(notificationObj);
    const dismissButton = screen.getAllBy('.notification-dismiss');
    fireEvent.click(dismissButton);
    await sleep(1000);
    const notificationRemoved = screen.queryAllBy('.notification');
    expect(notificationRemoved.length).toBe(0);
  });

  test('should not render title if not provided', done => {
    delete notificationObj.title;
    component.addNotification(notificationObj);
    const notification = screen.queryAllBy('.notification-title');
    expect(notification.length).toBe(0);
    done();
  });

  test('should not render message if not provided', done => {
    delete notificationObj.message;
    component.addNotification(notificationObj);
    const notification = screen.queryAllBy('.notification-message');
    expect(notification.length).toBe(0);
    done();
  });

  test('should not dismiss the notificaion on click if dismissible is false', done => {
    notificationObj.dismissible = false;
    component.addNotification(notificationObj);
    const notification = screen.getAllBy('.notification');
    fireEvent.click(notification);
    const notificationAfterClicked = screen.getAllBy('.notification');
    expect(notificationAfterClicked).to.not.be.null;
    done();
  });

  test('should not dismiss the notification on click if dismissible is none', done => {
    notificationObj.dismissible = 'none';
    component.addNotification(notificationObj);
    const notification = screen.getAllBy('.notification');
    fireEvent.click(notification);
    const notificationAfterClicked = screen.getAllBy('.notification');
    expect(notificationAfterClicked).toBeDefined();
    done();
  });

  test('should not dismiss the notification on click if dismissible is button', done => {
    notificationObj.dismissible = 'button';
    component.addNotification(notificationObj);
    const notification = screen.getAllBy('.notification');
    fireEvent.click(notification);
    const notificationAfterClicked = screen.getAllBy('.notification');
    expect(notificationAfterClicked).toBeDefined();
    done();
  });

  test('should render a button if action property is passed', done => {
    defaultNotification.action = {
      label: 'Click me',
      callback: function() {}
    };

    component.addNotification(defaultNotification);
    const button = screen.getAllBy('.notification-action-button');
    expect(button).toBeDefined();
    done();
  });

  test('should execute a callback function when notification button is clicked', done => {
    let testThis = false;
    notificationObj.action = {
      label: 'Click me',
      callback: function() {
        testThis = true;
      }
    };

    component.addNotification(notificationObj);
    const button = screen.getAllBy('.notification-action-button');
    fireEvent.click(button);
    expect(testThis).toBe(true);
    done();
  });

  test('should accept an action without callback function defined', done => {
    notificationObj.action = {
      label: 'Click me'
    };

    component.addNotification(notificationObj);
    const button = screen.getAllBy('.notification-action-button');
    fireEvent.click(button);
    const notification = screen.queryAllBy('.notification');
    expect(notification.length).toBe(0);
    done();
  });

  test('should execute a callback function on add a notification', done => {
    let testThis = false;
    notificationObj.onAdd = function() {
      testThis = true;
    };

    component.addNotification(notificationObj);
    expect(testThis).toBe(true);
    done();
  });

  test('should execute a callback function on remove a notification', done => {
    let testThis = false;
    notificationObj.onRemove = function() {
      testThis = true;
    };

    component.addNotification(notificationObj);
    const notification = screen.getAllBy('.notification');
    fireEvent.click(notification);
    expect(testThis).toBe(true);
    done();
  });

  test('should render a children if passed', done => {
    defaultNotification.children = (
      <div className="custom-container"></div>
    );

    component.addNotification(defaultNotification);
    const customContainer = screen.getAllBy('.custom-container');
    expect(customContainer).toBeDefined();
    done();
  });

  test('should pause the timer if a notification has a mouse enter', async() => {
    notificationObj.autoDismiss = 2;
    component.addNotification(notificationObj);
    const notification = screen.getAllBy('.notification');
    fireEvent.mouseEnter(notification);
    await sleep(4000);
    const _notification = screen.getAllBy('.notification');
    expect(_notification).toBeDefined();
  });

  test('should resume the timer if a notification has a mouse leave', async() => {
    notificationObj.autoDismiss = 2;
    component.addNotification(notificationObj);
    const notification = screen.getAllBy('.notification');
    fireEvent.mouseEnter(notification);
    await sleep(800);
    fireEvent.mouseLeave(notification);
    await sleep(2000);
    const _notification = screen.queryAllBy('.notification');
    expect(_notification.length).toBe(0);
  });

  test('should allow HTML inside messages', done => {
    defaultNotification.message = '<strong class="allow-html-strong">Strong</strong>';
    component.addNotification(defaultNotification);
    const notification = screen.getAllBy('.notification-message');
    const htmlElement = notification.getElementsByClassName('allow-html-strong');
    expect(htmlElement.length).toBe(1);
    done();
  });

  test('should render containers with a overriden width', done => {
    notificationObj.position = 'tc';
    component.addNotification(notificationObj);
    const notification = screen.getAllBy('.notifications-tc');
    const width = notification.style.width;
    expect(width).toBe('600px');
    done();
  });

  test('should render a notification with specific style based on position', done => {
    notificationObj.position = 'bc';
    component.addNotification(notificationObj);
    const notification = screen.getAllBy('.notification');
    const bottomPosition = notification.style.bottom;
    expect(bottomPosition).toBe('-100px');
    done();
  });

  test('should render containers with a overriden width for a specific position', done => {
    notificationObj.position = 'tl';
    component.addNotification(notificationObj);
    const notification = screen.getAllBy('.notifications-tl');
    const width = notification.style.width;
    expect(width).toBe('800px');
    done();
  });

  test('should throw an error if no level is defined', done => {
    delete notificationObj.level;
    expect(() => component.addNotification(notificationObj)).toThrow(/notification level is required/);
    done();
  });

  test('should throw an error if a invalid level is defined', done => {
    notificationObj.level = 'invalid';
    expect(() => component.addNotification(notificationObj)).toThrow(/is not a valid level/);
    done();
  });

  test('should throw an error if a invalid position is defined', done => {
    notificationObj.position = 'invalid';
    expect(() => component.addNotification(notificationObj)).toThrow(/is not a valid position/);
    done();
  });

  test('should throw an error if autoDismiss is not a number', done => {
    notificationObj.autoDismiss = 'string';
    expect(() => component.addNotification(notificationObj)).toThrow(/'autoDismiss' must be a number./);
    done();
  });

  test('should render 2nd notification below 1st one', done => {
    component.addNotification(Object.assign({}, defaultNotification, {title: '1st'}));
    component.addNotification(Object.assign({}, defaultNotification, {title: '2nd'}));

    const notifications = screen.queryAllBy('.notification');
    expect(notifications[0].getElementsByClassName('notification-title')[0].textContent).toBe('1st');
    expect(notifications[1].getElementsByClassName('notification-title')[0].textContent).toBe('2nd');
    done();
  });
});

describe('Notification Component with newOnTop=true', function() {
  let component;
  const ref = 'notificationSystem';

  jest.setTimeout(10000);

  beforeEach(() => {
    // We need to create this wrapper so we can use refs
    class ElementWrapper extends Component {
      render() {
        return <NotificationSystem ref={ ref } style={ style } allowHTML={ true } noAnimation={ true } newOnTop={ true } />;
      }
    }
    render(React.createElement(ElementWrapper));
    component = screen.getAllBy('.notifications-wrapper');
  });

  test('should render 2nd notification above 1st one', done => {
    component.addNotification(Object.assign({}, defaultNotification, {title: '1st'}));
    component.addNotification(Object.assign({}, defaultNotification, {title: '2nd'}));

    const notifications = screen.queryAllBy('.notification');
    expect(notifications[0].getElementsByClassName('notification-title')[0].textContent).toBe('2nd');
    expect(notifications[1].getElementsByClassName('notification-title')[0].textContent).toBe('1st');
    done();
  });
});
