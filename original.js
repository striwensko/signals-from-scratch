function writable(iv) {
	let value = iv;
	const subscribers = new Set();
	return {
		subscribe(fn) {
			subscribers.add(fn);
			fn(value);
			return () => {
				subscribers.delete(fn);
			};
		},
		set(new_value) {
			value = new_value;
			for (let fn of subscribers) {
				fn(value);
			}
		},
		update(get_new_value) {
			this.set(get_new_value(value));
		},
	};
}

const state = writable({
	count: 0,
	checked: false,
	value: 'The most useless demo',
});

state.subscribe(($state) => {
	if ($state.checked) {
		num.innerText = $state.count;
	}
});

state.subscribe(($state) => {
	checkbox.checked = $state.checked;
});

state.subscribe(($state) => {
	span.innerText = $state.value;
	input.value = $state.value;
});

button.addEventListener('click', () => {
	state.update(($state) => {
		return {
			...$state,
			count: $state.count + 1,
		};
	});
});

checkbox.addEventListener('change', (e) => {
	state.update(($state) => {
		return {
			...$state,
			checked: e.target.checked,
		};
	});
});

input.addEventListener('input', (e) => {
	state.update(($state) => {
		return {
			...$state,
			value: e.target.value,
		};
	});
});
