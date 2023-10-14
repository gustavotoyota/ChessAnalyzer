const _proxyInstanceSymbol = Symbol("proxy-instance");
const _proxyTargetSymbol = Symbol("proxy-target");

export function isProxyInstance(instance: any): boolean {
  return instance?.[_proxyInstanceSymbol] ?? false;
}

export function getProxyTarget<T>(instance: T): T {
  return (instance as any)?.[_proxyTargetSymbol] ?? instance;
}

export function createProxyInstance<T>(instance: T): T {
  if (isProxyInstance(instance)) {
    instance = getProxyTarget(instance);
  }

  return new Proxy(instance as any, {
    apply(target, thisArg, argArray) {
      return Reflect.apply(target, thisArg, argArray);
    },

    construct(target, argArray, newTarget) {
      return Reflect.construct(target, argArray, newTarget);
    },

    defineProperty(target, key, descriptor) {
      return Reflect.defineProperty(target, key, descriptor);
    },

    deleteProperty(target, key) {
      return Reflect.deleteProperty(target, key);
    },

    get(target, key, receiver) {
      if (key === _proxyInstanceSymbol) {
        return true;
      } else if (key === _proxyTargetSymbol) {
        return target;
      }

      return Reflect.get(target, key, receiver);
    },

    getOwnPropertyDescriptor(target, key) {
      return Reflect.getOwnPropertyDescriptor(target, key);
    },

    getPrototypeOf(target) {
      return Reflect.getPrototypeOf(target);
    },

    has(target, key) {
      return Reflect.has(target, key);
    },

    isExtensible(target) {
      return Reflect.isExtensible(target);
    },

    ownKeys(target) {
      return Reflect.ownKeys(target);
    },

    preventExtensions(target) {
      return Reflect.preventExtensions(target);
    },

    set(target, key, value, receiver) {
      return Reflect.set(target, key, value, receiver);
    },

    setPrototypeOf(target, prototype) {
      return Reflect.setPrototypeOf(target, prototype);
    },
  });
}
