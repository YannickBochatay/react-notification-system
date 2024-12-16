/**
 * @jest-environment jsdom
 */
import React, { Component, createRef, act } from 'react';
import { render, fireEvent } from '@testing-library/react';
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
  let node;
  const ref = createRef();

  jest.setTimeout(10000);

  beforeEach(() => {
    // We need to create this wrapper so we can use refs
    class ElementWrapper extends Component {
      render() {
        return <NotificationSystem ref={ ref } style={ style } allowHTML={ true } noAnimation={ true } />;
      }
    }
    node = render(React.createElement(ElementWrapper)).container;
    notificationObj = Object.assign({}, defaultNotification);
    component = ref.current;
  });

  test('should be rendered', async() => {
    expect(component).toBeDefined();

  });

  test('should render a single notification', async() => {
    await act(() => component.addNotification(defaultNotification));
    const notification = node.querySelectorAll('.notification');
    expect(notification.length).toBe(1);

  });

  test('should not set a notification visibility class when the notification is initially added', async() => {
    await act(() => component.addNotification(defaultNotification));
    const notification = node.querySelector('.notification');
    expect(notification.className).not.toMatch(/notification-hidden/);
    expect(notification.className).not.toMatch(/notification-visible/);

  });

  test('should set the notification class to visible after added', async() => {
    await act(() => component.addNotification(defaultNotification));
    const notification = node.querySelector('.notification');
    expect(notification.className).toMatch(/notification/);
    await sleep(400);
    expect(notification.className).toMatch(/notification-visible/);
  });

  test('should add additional classes to the notification if specified', async() => {
    await act(() => component.addNotification(Object.assign({},defaultNotification, {className: 'FOO'})));
    const notification = node.querySelector('.notification');
    expect(notification.className).toContain(' FOO');

  });

  test('should render notifications in all positions with all levels', async() => {
    let count = 0;
    for (let position of Object.keys(positions)) {
      for (let level of Object.keys(levels)) {
        notificationObj.position = positions[position];
        notificationObj.level = levels[level];
        await act(() => component.addNotification(notificationObj));
        count++;
      }
    }

    const containers = [];

    for (let position of Object.keys(positions)) {
      containers.push(node.querySelector('.notifications-' + positions[position]));
    }

    containers.forEach(function(container) {
      for (let level of Object.keys(levels)) {
        let notification = container.getElementsByClassName('notification-' + levels[level]);
        expect(notification).toBeDefined();
      }
    });

    const notifications = node.querySelectorAll('.notification');
    expect(notifications.length).toBe(count);

  });

  test('should render multiple notifications', async() => {
    const randomNumber = Math.floor(Math.random(5, 10));

    for (let i = 1; i <= randomNumber; i++) {
      await act(() => component.addNotification(defaultNotification));
    }

    const notifications = node.querySelectorAll('.notification');
    expect(notifications.length).toBe(randomNumber);

  });

  test('should not render notifications with the same uid', async() => {
    notificationObj.uid = 500;
    await act(() => component.addNotification(notificationObj));
    await act(() => component.addNotification(notificationObj));
    const notification = node.querySelectorAll('.notification');
    expect(notification.length).toBe(1);

  });

  test('should remove a notification after autoDismiss', async () => {
    notificationObj.autoDismiss = 2;
    await act(() => component.addNotification(notificationObj));
    await sleep(3000);
    const notification = node.querySelectorAll('.notification');
    expect(notification.length).toBe(0);
  });

  test('should remove a notification using returned object', async() => {
    const notificationCreated = await act(() => component.addNotification(defaultNotification));
    const notification = node.querySelectorAll('.notification');
    expect(notification.length).toBe(1);

    await act(() => component.removeNotification(notificationCreated));
    await sleep(1000);
    const notificationRemoved = node.querySelectorAll('.notification');
    expect(notificationRemoved.length).toBe(0);
  });

  test('should remove a notification using uid', async() => {
    const notificationCreated = await act(() => component.addNotification(defaultNotification));
    const notification = node.querySelectorAll('.notification');
    expect(notification.length).toBe(1);

    await act(() => component.removeNotification(notificationCreated.uid));
    await sleep(200);
    const notificationRemoved = node.querySelectorAll('.notification');
    expect(notificationRemoved.length).toBe(0);
  });

  test('should edit an existing notification using returned object', async() => {
    const notificationCreated = await act(() => component.addNotification(defaultNotification));
    const notification = node.querySelector('.notification');
    expect(notification.length).toBe(1);

    const newTitle = 'foo';
    const newContent = 'foobar';

    await act(() => component.editNotification(notificationCreated, { title: newTitle, message: newContent }));
    await sleep(1000);
    const notificationEdited = node.querySelectorAll('.notification');
    expect(notificationEdited.querySelector('.notification-title').textContent).toBe(newTitle);
    expect(notificationEdited.querySelector('.notification-message').textContent).toBe(newContent);
  });

  test('should edit an existing notification using uid', async() => {
    const notificationCreated = await act(() => component.addNotification(defaultNotification));
    const notification = node.querySelectorAll('.notification');
    expect(notification.length).toBe(1);

    const newTitle = 'foo';
    const newContent = 'foobar';

    await act(() => component.editNotification(notificationCreated.uid, { title: newTitle, message: newContent }));
    await sleep(1000);
    const notificationEdited = node.querySelectorAll('.notification');
    expect(notificationEdited.querySelector('.notification-title').textContent).toBe(newTitle);
    expect(notificationEdited.querySelector('.notification-message').textContent).toBe(newContent);
  });

  test('should remove all notifications', async() => {
    await act(() => component.addNotification(defaultNotification));
    await act(() => component.addNotification(defaultNotification));
    await act(() => component.addNotification(defaultNotification));
    const notification = node.querySelectorAll('.notification');
    expect(notification.length).toBe(3);
    await act(() => component.clearNotifications());
    await sleep(200);
    const notificationRemoved = node.querySelectorAll('.notification');
    expect(notificationRemoved.length).toBe(0);
  });

  test('should dismiss notification on click', async() => {
    await act(() => component.addNotification(notificationObj));
    const notification = node.querySelector('.notification');
    await act(() => fireEvent.click(notification));
    await sleep(1000);
    const notificationRemoved = node.querySelectorAll('.notification');
    expect(notificationRemoved.length).toBe(0);
  });

  test('should dismiss notification on click of dismiss button', async() => {
    await act(() => component.addNotification(notificationObj));
    const dismissButton = node.querySelector('.notification-dismiss');
    await act(() => fireEvent.click(dismissButton));
    await sleep(1000);
    const notificationRemoved = node.querySelectorAll('.notification');
    expect(notificationRemoved.length).toBe(0);
  });

  test('should not render title if not provided', async() => {
    delete notificationObj.title;
    await act(() => component.addNotification(notificationObj));
    const notification = node.querySelectorAll('.notification-title');
    expect(notification.length).toBe(0);

  });

  test('should not render message if not provided', async() => {
    delete notificationObj.message;
    await act(() => component.addNotification(notificationObj));
    const notification = node.querySelectorAll('.notification-message');
    expect(notification.length).toBe(0);

  });

  test('should not dismiss the notificaion on click if dismissible is false', async() => {
    notificationObj.dismissible = false;
    await act(() => component.addNotification(notificationObj));
    const notification = node.querySelector('.notification');
    await act(() => fireEvent.click(notification));
    const notificationAfterClicked = node.querySelector('.notification');
    expect(notificationAfterClicked).toBeDefined;

  });

  test('should not dismiss the notification on click if dismissible is none', async() => {
    notificationObj.dismissible = 'none';
    await act(() => component.addNotification(notificationObj));
    const notification = node.querySelector('.notification');
    await act(() => fireEvent.click(notification));
    const notificationAfterClicked = node.querySelectorAll('.notification');
    expect(notificationAfterClicked).toBeDefined();

  });

  test('should not dismiss the notification on click if dismissible is button', async() => {
    notificationObj.dismissible = 'button';
    await act(() => component.addNotification(notificationObj));
    const notification = node.querySelector('.notification');
    await act(() => fireEvent.click(notification));
    const notificationAfterClicked = node.querySelector('.notification');
    expect(notificationAfterClicked).toBeDefined();

  });

  test('should render a button if action property is passed', async() => {
    defaultNotification.action = {
      label: 'Click me',
      callback: function() {}
    };

    await act(() => component.addNotification(defaultNotification));
    const button = node.querySelector('.notification-action-button');
    expect(button).toBeDefined();

  });

  test('should execute a callback function when notification button is clicked', async() => {
    let testThis = false;
    notificationObj.action = {
      label: 'Click me',
      callback: function() {
        testThis = true;
      }
    };

    await act(() => component.addNotification(notificationObj));
    const button = node.querySelector('.notification-action-button');
    await act(() => fireEvent.click(button));
    expect(testThis).toBe(true);

  });

  test('should accept an action without callback function defined', async() => {
    notificationObj.action = {
      label: 'Click me'
    };

    await act(() => component.addNotification(notificationObj));
    const button = node.querySelector('.notification-action-button');
    await act(() => fireEvent.click(button));
    const notification = node.querySelectorAll('.notification');
    expect(notification.length).toBe(0);

  });

  test('should execute a callback function on add a notification', async() => {
    let testThis = false;
    notificationObj.onAdd = function() {
      testThis = true;
    };

    await act(() => component.addNotification(notificationObj));
    expect(testThis).toBe(true);

  });

  test('should execute a callback function on remove a notification', async() => {
    let testThis = false;
    notificationObj.onRemove = function() {
      testThis = true;
    };

    await act(() => component.addNotification(notificationObj));
    const notification = node.querySelector('.notification');
    await act(() => fireEvent.click(notification));
    expect(testThis).toBe(true);

  });

  test('should render a children if passed', async() => {
    defaultNotification.children = (
      <div className="custom-container"></div>
    );

    await act(() => component.addNotification(defaultNotification));
    const customContainer = node.querySelector('.custom-container');
    expect(customContainer).toBeDefined();

  });

  test('should pause the timer if a notification has a mouse enter', async() => {
    notificationObj.autoDismiss = 2;
    await act(() => component.addNotification(notificationObj));
    const notification = node.querySelector('.notification');
    await act(() => fireEvent.mouseEnter(notification));
    await sleep(4000);
    const _notification = node.querySelector('.notification');
    expect(_notification).toBeDefined();
  });

  test('should resume the timer if a notification has a mouse leave', async() => {
    notificationObj.autoDismiss = 2;
    await act(() => component.addNotification(notificationObj));
    const notification = node.querySelector('.notification');
    await act(() => fireEvent.mouseEnter(notification));
    await sleep(800);
    await act(() => fireEvent.mouseLeave(notification));
    await sleep(2000);
    const _notification = node.querySelectorAll('.notification');
    expect(_notification.length).toBe(0);
  });

  test('should allow HTML inside messages', async() => {
    defaultNotification.message = '<strong class="allow-html-strong">Strong</strong>';
    await act(() => component.addNotification(defaultNotification));
    const notification = node.querySelector('.notification-message');
    const htmlElement = notification.getElementsByClassName('allow-html-strong');
    expect(htmlElement.length).toBe(1);

  });

  test('should render containers with a overriden width', async() => {
    notificationObj.position = 'tc';
    await act(() => component.addNotification(notificationObj));
    const notification = node.querySelector('.notifications-tc');
    const width = notification.style.width;
    expect(width).toBe('600px');

  });

  test('should render a notification with specific style based on position', async() => {
    notificationObj.position = 'bc';
    await act(() => component.addNotification(notificationObj));
    const notification = node.querySelector('.notification');
    const bottomPosition = notification.style.bottom;
    expect(bottomPosition).toBe('-100px');

  });

  test('should render containers with a overriden width for a specific position', async() => {
    notificationObj.position = 'tl';
    await act(() => component.addNotification(notificationObj));
    const notification = node.querySelector('.notifications-tl');
    const width = notification.style.width;
    expect(width).toBe('800px');

  });

  test('should throw an error if no level is defined', async() => {
    delete notificationObj.level;
    await expect(() => component.addNotification(notificationObj)).rejects.toThrow(/notification level is required/);

  });

  test('should throw an error if a invalid level is defined', async() => {
    notificationObj.level = 'invalid';
    await expect(act(() => component.addNotification(notificationObj))).rejects.toThrow(/is not a valid level/);
  });

  test('should throw an error if a invalid position is defined', async() => {
    notificationObj.position = 'invalid';
    await expect(act(() => component.addNotification(notificationObj))).rejects.toThrow(/is not a valid position/);

  });

  test('should throw an error if autoDismiss is not a number', async() => {
    notificationObj.autoDismiss = 'string';
    await expect(act(() => component.addNotification(notificationObj))).rejects.toThrow(/'autoDismiss' must be a number./);

  });

  test('should render 2nd notification below 1st one', async() => {
    await act(() => component.addNotification(Object.assign({}, defaultNotification, {title: '1st'})));
    await act(() => component.addNotification(Object.assign({}, defaultNotification, {title: '2nd'})));

    const notifications = node.querySelectorAll('.notification');
    expect(notifications[0].querySelector('.notification-title').textContent).toBe('1st');
    expect(notifications[1].querySelector('.notification-title').textContent).toBe('2nd');

  });
});

describe('Notification Component with newOnTop=true', function() {
  let component;
  let node;
  const ref = createRef();

  jest.setTimeout(10000);

  beforeEach(() => {
    // We need to create this wrapper so we can use refs
    class ElementWrapper extends Component {
      render() {
        return <NotificationSystem ref={ ref } style={ style } allowHTML={ true } noAnimation={ true } newOnTop={ true } />;
      }
    }
    node = render(React.createElement(ElementWrapper)).container;
    component = ref.current;
  });

  test('should render 2nd notification above 1st one', async() => {
    await act(() => component.addNotification(Object.assign({}, defaultNotification, {title: '1st'})));
    await act(() => component.addNotification(Object.assign({}, defaultNotification, {title: '2nd'})));

    const notifications = node.querySelectorAll('.notification');
    expect(notifications[0].querySelector('.notification-title').textContent).toBe('2nd');
    expect(notifications[1].querySelector('.notification-title').textContent).toBe('1st');

  });
});
