import { Identifiers, Resolvers } from '../../src';

describe('Emoji resolver tests', () => {
	test('GIVEN an unicode emoji THEN returns emojiObject', () => {
		const resolvedEmoji = Resolvers.resolveEmoji('😄');
		expect(resolvedEmoji.success).toBe(true);
		expect(resolvedEmoji.error).toBeUndefined();
		expect(resolvedEmoji.value).toMatchObject({ id: null, name: '😄' });
	});
	test('GIVEN a string emoji THEN returns ArgumentEmojiError', () => {
		const resolvedEmoji = Resolvers.resolveEmoji(':smile:');
		expect(resolvedEmoji.success).toBe(false);
		expect(resolvedEmoji.error).toBe(Identifiers.ArgumentEmojiError);
	});
	test('GIVEN a string THEN returns ArgumentEmojiError', () => {
		const resolvedEmoji = Resolvers.resolveEmoji('foo');
		expect(resolvedEmoji.success).toBe(false);
		expect(resolvedEmoji.error).toBe(Identifiers.ArgumentEmojiError);
	});
	test('GIVEN a wrongly formatted string custom emoji THEN returns ArgumentEmojiError', () => {
		const resolvedEmoji = Resolvers.resolveEmoji('<custom:737141877803057244>');
		expect(resolvedEmoji.success).toBe(false);
		expect(resolvedEmoji.error).toBe(Identifiers.ArgumentEmojiError);
	});
	test('GIVEN a string custom emoji THEN returns emojiObject', () => {
		const resolvedEmoji = Resolvers.resolveEmoji('<:custom:737141877803057244>');
		expect(resolvedEmoji.success).toBe(true);
		expect(resolvedEmoji.error).toBeUndefined();
		expect(resolvedEmoji.value).toMatchObject({ id: '737141877803057244', name: 'custom' });
	});
	test('GIVEN a string custom animated emoji THEN returns emojiObject', () => {
		const resolvedEmoji = Resolvers.resolveEmoji('<a:custom:737141877803057244>');
		expect(resolvedEmoji.success).toBe(true);
		expect(resolvedEmoji.error).toBeUndefined();
		expect(resolvedEmoji.value).toMatchObject({ animated: true, id: '737141877803057244', name: 'custom' });
	});
});
