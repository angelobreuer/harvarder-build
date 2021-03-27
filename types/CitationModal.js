function createCustomInput(props) {
    const modelType = props.model.type;
    const rendered = modelType.render({
        required: props.model.required,
        value: props.isNew ? undefined : props.value,
        onInput: props.onInput,
        placeholder: props.placeholder
    });
    return { input: rendered.element, value: rendered.value };
}
function createStandardInput(props) {
    const input = document.createElement('input');
    input.type = props.model.type;
    input.required = props.model.required;
    input.placeholder = props.placeholder;
    input.className = 'text-gray-100 w-full my-2 border-2 border-gray-500 hover:border-indigo-600 px-4 py-1 rounded-md';
    input.style.backgroundColor = '#1F2022';
    input.oninput = () => {
        const value = props.model.type === 'date'
            ? input.valueAsDate
            : props.model.type === 'number'
                ? input.valueAsNumber : input.value;
        props.onInput(value);
    };
    if (!props.isNew) {
        input.defaultValue = props.value;
    }
    if (props.model.type === 'date') {
        input.valueAsDate = new Date();
    }
    return { input, value: props.value };
}
export function createModal({ element, provider, onexit, onupdate, data, isNew }) {
    const options = data || {};
    const placeholder = provider.getDefaultOptions();
    const providerModel = provider.getModel();
    const preview = document.createElement('div');
    const form = document.createElement('form');
    const unsetProperties = isNew ? Object.keys(options) : [];
    const abortButton = document.createElement('button');
    abortButton.className = 'absolute right-3 top-3 font-bold px-4 text-red-700';
    abortButton.textContent = 'x';
    element.appendChild(preview);
    form.appendChild(abortButton);
    // pre-render
    provider.generate(options, preview);
    Object.keys(providerModel).forEach(name => {
        const model = providerModel[name];
        if (!model) {
            return;
        }
        const label = document.createElement('label');
        const description = document.createElement('p');
        const div = document.createElement('div');
        const onInput = (value) => {
            preview.innerHTML = '';
            options[name] = value;
            provider.generate(options, preview);
            onupdate === null || onupdate === void 0 ? void 0 : onupdate();
            const index = unsetProperties.indexOf(name);
            // remove from unset properties
            if (index >= 0) {
                unsetProperties.splice(index, 1);
            }
        };
        const inputFactory = typeof model.type === 'string' ? createStandardInput : createCustomInput;
        const { input, value } = inputFactory({ placeholder: placeholder[name] || '', model, onInput, value: options[name], isNew });
        options[name] = value;
        div.className = 'mt-4';
        label.textContent = model.name;
        label.className = 'text-white';
        description.textContent = model.description;
        description.className = 'text-gray-400';
        if (model.required) {
            label.textContent += '*';
        }
        div.appendChild(label);
        div.appendChild(description);
        div.appendChild(input);
        element.appendChild(div);
    });
    const saveButton = document.createElement('button');
    saveButton.type = 'submit';
    saveButton.className = 'bg-indigo-800 hover:bg-indigo-700 focus:shadow-outline focus:outline-none text-white text-xs py-2 mx-auto mt-6 px-10 rounded w-full';
    saveButton.textContent = 'Quelle speichern';
    const saveCallback = onexit ? () => onexit('save') : () => { };
    if (onexit) {
        abortButton.onclick = () => onexit('abort');
    }
    form.onsubmit = (event) => {
        const unsetPropertiesNames = unsetProperties
            .filter(x => x !== 'type')
            .map(x => providerModel[x])
            .filter(x => x.required && x.type !== 'date')
            .map(x => `${x.name} (${x.description})`);
        if (unsetPropertiesNames.length > 0) {
            alert('Die folgenden Felder wurden noch nicht ausgefüllt: \n\n• ' + unsetPropertiesNames.join('\n• '));
            event.preventDefault();
            return;
        }
        saveCallback();
    };
    if (!isNew) {
        const deleteButton = document.createElement('button');
        deleteButton.className = 'bg-red-800 hover:bg-red-700 focus:shadow-outline focus:outline-none text-white text-xs py-2 mx-auto mt-3 px-10 rounded w-full';
        deleteButton.textContent = 'Quelle löschen';
        form.appendChild(deleteButton);
        if (onexit) {
            deleteButton.onclick = () => onexit('delete');
        }
    }
    form.appendChild(saveButton);
    element.appendChild(form);
}
