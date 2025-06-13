let current_effect = null;

function $effect(fn) {
	const deps = new Set();
	function actual_effect() {
		for (const dep of deps) {
			dep.delete(actual_effect);
		}
		deps.clear();
		current_effect = { fn: actual_effect, deps };
		fn();
		current_effect = null;
	}
	actual_effect();
}

const to_run = new Set();

function schedule() {
	if (to_run.size > 0) return;
	queueMicrotask(() => {
		for (const fn of to_run) {
			fn();
		}
		to_run.clear();
	});
}

function $state(iv) {
	const subscribers = new Map();
	return new Proxy(iv, {
		get(target, key) {
			// if we are running in a function we want
			// to add that function as a subscriber
			if (current_effect) {
				if (!subscribers.has(key)) {
					subscribers.set(key, new Set());
				}
				const deps = subscribers.get(key);
				deps.add(current_effect.fn);
				current_effect.deps.add(deps);
			}
			return target[key];
		},
		set(target, key, value) {
			target[key] = value;
			for (let fn of [...(subscribers.get(key) ?? [])]) {
				schedule();
				to_run.add(fn);
			}
			return true;
		},
	});
}

const state = $state({
	count: 0,
	checked: false,
       value: 'The Most useless demo!',
});

$effect(() => {
	console.log('checking');
	if (state.checked) {
		num.innerText = state.count;
	}
});

$effect(() => {
	checkbox.checked = state.checked;
});

$effect(() => {
	span.innerText = state.value;
	input.value = state.value;
});

button.addEventListener('click', () => {
	state.count += 1;
});

checkbox.addEventListener('change', (e) => {
	state.checked = e.target.checked;
});

input.addEventListener('input', (e) => {
	state.value = 'JS Nation';
	state.value = e.target.value;
});
