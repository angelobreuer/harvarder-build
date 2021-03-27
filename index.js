var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Registry } from "./types/Citation.js";
import { createModal } from "./types/CitationModal.js";
import Citations, { save, saveCitations } from "./Storage.js";
import './types/BookCitation.js';
import './types/JournalCitation.js';
import './types/BookArticleCitation.js';
import './types/OnlineSourceCitation.js';
import downloadAsJson from "./util/InlineDownloader.js";
import copyRichContentToClipboard from "./util/ClipboardHelper.js";
const modalContainer = document.getElementById('modal-container');
const overview = document.getElementById('overview');
function appendCitation(citation) {
    const div = document.createElement('div');
    overview.appendChild(div);
    div.className = 'hover:bg-gray-100 hover:bg-opacity-10 shadow p-5 md-rounded text-justify';
    const preview = { data: citation, element: div, regenerate: undefined, deleted: false };
    const regenerate = () => {
        div.innerHTML = '';
        if (!preview.deleted) {
            Registry.get(citation.type).generate(citation, div);
        }
        else if (div.isConnected) {
            div.remove();
        }
    };
    preview.regenerate = regenerate;
    div.onclick = () => edit(preview);
    regenerate();
}
function create(type) {
    const wrapper = document.createElement('div');
    const div = document.createElement('div');
    const data = Object.assign(Object.assign({}, Registry.get(type).getDefaultOptions()), { type });
    wrapper.appendChild(div);
    modalContainer.appendChild(wrapper);
    wrapper.className = 'relative p-10 border-indigo-600 md:m-10 m-4 border-2 lg:w-1/2 md:w-3/4 w-full';
    modalContainer.classList.remove('hidden');
    createModal({
        element: div,
        provider: Registry.get(data.type),
        data,
        isNew: true,
        onexit: (type) => {
            modalContainer.classList.add('hidden');
            modalContainer.innerHTML = '';
            if (type === 'save') {
                Citations.push(data);
                appendCitation(data);
                save();
            }
        }
    });
}
function edit(citation) {
    const wrapper = document.createElement('div');
    const div = document.createElement('div');
    const shallowData = JSON.parse(JSON.stringify(citation.data));
    wrapper.appendChild(div);
    modalContainer.appendChild(wrapper);
    wrapper.className = 'relative p-10 border-indigo-600 md:m-10 m-4 border-2 lg:w-1/2 md:w-3/4 w-full';
    modalContainer.classList.remove('hidden');
    createModal({
        element: div,
        provider: Registry.get(shallowData.type),
        data: shallowData,
        onexit: (type) => {
            modalContainer.classList.add('hidden');
            modalContainer.innerHTML = '';
            if (type === 'save') {
                Object.assign(citation.data, shallowData);
            }
            else if (type === 'delete') {
                const index = Citations.indexOf(citation.data);
                if (index >= 0) {
                    Citations.splice(index, 1);
                }
                else {
                    alert('Interner Fehler beim Löschen des Zitats: Das Zitat wurde bereits im Speicher gelöscht.');
                }
                citation.deleted = true;
                save();
            }
            citation.regenerate();
        }
    });
}
document.querySelectorAll('button[data-citation-type]').forEach(button => {
    const buttonElement = button;
    buttonElement.onclick = () => create(button.getAttribute('data-citation-type'));
});
document.getElementById('export-button').onclick = () => {
    downloadAsJson('harvarder.json', JSON.stringify(Citations));
};
document.getElementById('import-button').onclick = () => {
    const readFile = (file) => __awaiter(void 0, void 0, void 0, function* () {
        const text = yield file.text();
        if (file.type !== 'application/json') {
            throw 'Invalid mime type';
        }
        const json = JSON.parse(text);
        if (!confirm('Achtung! Beim Laden einer neuen Datei werden jegliche Änderungen an Zitaten überschrieben. Wollen Sie wirklich fortfahren?')) {
            return;
        }
        saveCitations(json);
        document.location.reload();
    });
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = () => {
        if (!input.files || input.files.length !== 1) {
            alert('Ungültige Eingabe.');
            return;
        }
        const file = input.files.item(0);
        readFile(file).catch(() => alert('Ungültiger Dateiinhalt.'));
    };
    document.body.appendChild(input);
    input.className = 'hidden';
    input.click();
    document.body.removeChild(input);
};
document.getElementById('delete-all-button').onclick = () => {
    if (overview.innerHTML.length === 0) {
        return;
    }
    if (!confirm("Wollen Sie wirklich alle Einträge löschen?")) {
        return;
    }
    overview.innerHTML = '';
    saveCitations([]);
};
document.getElementById('copy-button').onclick = () => {
    copyRichContentToClipboard(overview);
};
Citations.forEach(appendCitation);
save();
