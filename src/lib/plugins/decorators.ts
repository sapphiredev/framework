import { constructorEnd, constructorStart } from './Symbols';

export function createLifecycleMethodDecorator(hook: symbol) {
	return (target: Record<PropertyKey, unknown>, method: string) => {
		return new Proxy(target, {
			get(targt, property) {
				if (property !== hook) return undefined;
				return targt[method];
			}
		});
	};
}

export const constructorStartPlug = () => createLifecycleMethodDecorator(constructorStart);
export const constructorEndPlug = () => createLifecycleMethodDecorator(constructorEnd);
