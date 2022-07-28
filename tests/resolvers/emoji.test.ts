import { Identifiers, Resolvers, Result } from '../../src';

describe('Emoji resolver tests', () => {
	test('GIVEN an unicode emoji THEN returns emojiObject', () => {
		const resolvedEmoji = Resolvers.resolveEmoji('😄');
		expect(resolvedEmoji.isOk()).toBe(true);
		expect(resolvedEmoji.unwrapErr).toThrowError();
		expect(resolvedEmoji.unwrap()).toMatchObject({ id: null, name: '😄' });
	});
	test('GIVEN a string emoji THEN returns ArgumentEmojiError', () => {
		const resolvedEmoji = Resolvers.resolveEmoji(':smile:');
		expect(resolvedEmoji).toEqual(Result.err(Identifiers.ArgumentEmojiError));
	});
	test('GIVEN a string THEN returns ArgumentEmojiError', () => {
		const resolvedEmoji = Resolvers.resolveEmoji('foo');
		expect(resolvedEmoji).toEqual(Result.err(Identifiers.ArgumentEmojiError));
	});
	test('GIVEN a wrongly formatted string custom emoji THEN returns ArgumentEmojiError', () => {
		const resolvedEmoji = Resolvers.resolveEmoji('<custom:737141877803057244>');
		expect(resolvedEmoji).toEqual(Result.err(Identifiers.ArgumentEmojiError));
	});
	test('GIVEN a string custom emoji THEN returns emojiObject', () => {
		const resolvedEmoji = Resolvers.resolveEmoji('<:custom:737141877803057244>');
		expect(resolvedEmoji.isOk()).toBe(true);
		expect(resolvedEmoji.unwrapErr).toThrowError();
		expect(resolvedEmoji.unwrap()).toMatchObject({ id: '737141877803057244', name: 'custom' });
	});
	test('GIVEN a string custom animated emoji THEN returns emojiObject', () => {
		const resolvedEmoji = Resolvers.resolveEmoji('<a:custom:737141877803057244>');
		expect(resolvedEmoji.isOk()).toBe(true);
		expect(resolvedEmoji.unwrapErr).toThrowError();
		expect(resolvedEmoji.unwrap()).toMatchObject({ animated: true, id: '737141877803057244', name: 'custom' });
	});
});
