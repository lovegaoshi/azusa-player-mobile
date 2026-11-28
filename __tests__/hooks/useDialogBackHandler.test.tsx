import React from 'react';
import { BackHandler } from 'react-native';
import renderer, { act } from 'react-test-renderer';

import useDialogBackHandler from '../../src/hooks/useDialogBackHandler';

const TestDialog = ({
  visible,
  onDismiss,
}: {
  visible: boolean;
  onDismiss: () => void;
}) => {
  useDialogBackHandler(visible, onDismiss);
  return null;
};

describe('useDialogBackHandler', () => {
  let remove: jest.Mock;
  let addEventListener: jest.SpyInstance;
  let onBackPress: () => boolean;

  beforeEach(() => {
    remove = jest.fn();
    addEventListener = jest
      .spyOn(BackHandler, 'addEventListener')
      .mockImplementation((_eventName, callback) => {
        onBackPress = callback as () => boolean;
        return { remove };
      });
  });

  afterEach(() => jest.restoreAllMocks());

  it('does not listen for back presses while the dialog is hidden', () => {
    act(() => {
      renderer.create(<TestDialog visible={false} onDismiss={jest.fn()} />);
    });

    expect(addEventListener).not.toHaveBeenCalled();
  });

  it('dismisses the dialog on back press and unsubscribes when it closes', () => {
    const onDismiss = jest.fn();
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<TestDialog visible onDismiss={onDismiss} />);
    });

    expect(addEventListener).toHaveBeenCalledWith(
      'hardwareBackPress',
      expect.any(Function),
    );
    expect(onBackPress()).toBe(true);
    expect(onDismiss).toHaveBeenCalledTimes(1);

    act(() => {
      tree.update(<TestDialog visible={false} onDismiss={onDismiss} />);
    });
    expect(remove).toHaveBeenCalledTimes(1);
  });

  it('uses the latest dismiss callback without re-subscribing', () => {
    const initialDismiss = jest.fn();
    const updatedDismiss = jest.fn();
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<TestDialog visible onDismiss={initialDismiss} />);
    });

    act(() => {
      tree.update(<TestDialog visible onDismiss={updatedDismiss} />);
    });
    onBackPress();

    expect(addEventListener).toHaveBeenCalledTimes(1);
    expect(initialDismiss).not.toHaveBeenCalled();
    expect(updatedDismiss).toHaveBeenCalledTimes(1);
  });
});
