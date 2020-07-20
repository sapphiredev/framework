import main from '../src';

describe('Tests', () => {
	test('should pass', () => {
		expect(main()).toBe('this builds and pushes');
	});
});
