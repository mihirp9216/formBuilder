"use strict";
// Class for managing forms and their functionality.
class FormManager {
    constructor() {
        this.forms = [];
        this.currentFormId = null;
        this.responses = {};
        this.loadForms();
        this.renderFormsList();
        this.bindEvents();
    }
    // Listeners are here
    bindEvents() {
        var _a, _b, _c;
        (_a = document
            .getElementById("createFormBtn")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => this.createForm());
        (_b = document
            .getElementById("addFieldBtn")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => this.addField());
        (_c = document
            .getElementById("saveFormBtn")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", () => this.saveForm());
    }
    createForm() {
        const formTitle = prompt("Enter form title:", "New Form");
        if (formTitle) {
            const newForm = {
                id: this.generateId(),
                title: formTitle,
                fields: [],
            };
            this.forms.push(newForm);
            this.currentFormId = newForm.id;
            this.renderForm();
            const saveFormBtn = document.getElementById("saveFormBtn");
            if (saveFormBtn) {
                saveFormBtn.classList.remove("hidden"); // Remove hidden class
            }
        }
    }
    addField() {
        if (this.currentFormId) {
            const fieldType = prompt("Enter field type (text, email, number, select, textarea, radio, checkbox):", "text");
            const fieldLabel = prompt("Enter field label:", "Field Label");
            let options;
            if (fieldType === "select" ||
                fieldType === "radio" ||
                fieldType === "checkbox") {
                options = this.getOptions();
            }
            if (fieldType && fieldLabel) {
                const newField = {
                    id: this.generateId(),
                    label: fieldLabel,
                    type: fieldType,
                    options: options,
                };
                const formIndex = this.forms.findIndex((form) => form.id === this.currentFormId);
                if (formIndex !== -1) {
                    this.forms[formIndex].fields.push(newField);
                    this.renderFormFields();
                }
            }
        }
    }
    getOptions() {
        const options = prompt("Enter options separated by commas:", "Option 1, Option 2");
        return options ? options.split(",").map((option) => option.trim()) : [];
    }
    saveForm() {
        var _a;
        if (this.currentFormId) {
            const formIndex = this.forms.findIndex((form) => form.id === this.currentFormId);
            if (formIndex !== -1) {
                const form = this.forms[formIndex];
                localStorage.setItem(form.id, JSON.stringify(form));
                alert("Form saved!");
                this.renderFormsList();
                this.clearFormFields();
                (_a = document.getElementById("saveFormBtn")) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
            }
        }
    }
    clearFormFields() {
        const formFields = document.getElementById("formFields");
        if (formFields) {
            formFields.innerHTML = "";
        }
    }
    renderFormsList() {
        const formList = document.getElementById("formList");
        if (formList) {
            formList.innerHTML = "";
            this.forms.forEach((form) => {
                const formItem = document.createElement("div");
                formItem.textContent = form.title;
                formItem.addEventListener("click", () => this.loadForm(form.id));
                formList.appendChild(formItem);
            });
        }
    }
    loadForm(formId) {
        const form = this.forms.find((f) => f.id === formId);
        if (form) {
            this.currentFormId = formId;
            this.renderForm();
        }
    }
    renderForm() {
        var _a;
        const formTitleElement = document.getElementById("formTitle");
        if (formTitleElement) {
            formTitleElement.textContent =
                ((_a = this.forms.find((f) => f.id === this.currentFormId)) === null || _a === void 0 ? void 0 : _a.title) || "Form";
        }
        this.renderFormFields();
        this.renderSubmitButton();
        const formArea = document.getElementById("formArea");
        if (formArea) {
            formArea.classList.remove("hidden");
        }
    }
    renderFormFields() {
        const formFields = document.getElementById("formFields");
        if (formFields) {
            formFields.innerHTML = "";
            const form = this.forms.find((f) => f.id === this.currentFormId);
            if (form) {
                form.fields.forEach((field) => {
                    const fieldContainer = document.createElement("div");
                    fieldContainer.className = "field-container";
                    const label = document.createElement("label");
                    label.textContent = field.label;
                    fieldContainer.appendChild(label);
                    this.createFieldElement(field, fieldContainer);
                    formFields.appendChild(fieldContainer);
                });
            }
        }
    }
    renderSubmitButton() {
        const formContainer = document.getElementById("formArea");
        if (formContainer) {
            const existingSubmitButton = formContainer.querySelector(".submit-button");
            if (existingSubmitButton) {
                existingSubmitButton.remove();
            }
            const submitButton = document.createElement("button");
            submitButton.textContent = "Submit";
            submitButton.className = "submit-button";
            submitButton.addEventListener("click", () => this.submitForm());
            formContainer.appendChild(submitButton);
        }
    }
    submitForm() {
        var _a;
        const form = this.forms.find((f) => f.id === this.currentFormId);
        if (form) {
            const responses = {};
            form.fields.forEach((field) => {
                // Select all labels and find the one that matches the field label
                const labels = document.querySelectorAll(".field-container label");
                const matchingLabel = Array.from(labels).find((label) => label.textContent === field.label);
                if (matchingLabel) {
                    const fieldContainer = matchingLabel.parentElement;
                    if (fieldContainer) {
                        switch (field.type) {
                            case "text":
                            case "email":
                            case "number":
                                const input = fieldContainer.querySelector("input");
                                responses[field.label] = input ? input.value : "";
                                break;
                            case "textarea":
                                const textarea = fieldContainer.querySelector("textarea");
                                responses[field.label] = textarea ? textarea.value : "";
                                break;
                            case "select":
                                const select = fieldContainer.querySelector("select");
                                responses[field.label] = select ? select.value : "";
                                break;
                            case "radio":
                            case "checkbox":
                                const checkedInputs = fieldContainer.querySelectorAll(`input[type='${field.type}']:checked`);
                                responses[field.label] = Array.from(checkedInputs).map((input) => {
                                    return input.value;
                                });
                                break;
                        }
                    }
                }
            });
            this.responses[form.id] = responses;
            const allResponses = JSON.parse(localStorage.getItem("allResponses") || "{}");
            allResponses[form.id] = allResponses[form.id] || [];
            allResponses[form.id].push(responses);
            localStorage.setItem("allResponses", JSON.stringify(allResponses));
            this.displayResponses(responses);
            (_a = document.getElementById("formArea")) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
            alert("Form submitted successfully!");
        }
    }
    displayResponses(responses) {
        const responseDisplay = document.getElementById("responseDisplay");
        if (responseDisplay) {
            responseDisplay.innerHTML = "";
            const responseTitle = document.createElement("h3");
            responseTitle.textContent = "Submitted Responses:";
            responseDisplay.appendChild(responseTitle);
            for (const [key, value] of Object.entries(responses)) {
                const responseItem = document.createElement("div");
                responseItem.textContent = `${key}: ${value}`;
                responseDisplay.appendChild(responseItem);
            }
            console.log("Stored Responses:", JSON.parse(localStorage.getItem("allResponses") || "{}"));
        }
    }
    createFieldElement(field, container) {
        var _a, _b;
        switch (field.type) {
            case "text":
            case "email":
            case "number":
                const input = document.createElement("input");
                input.type = field.type;
                input.placeholder = field.label;
                container.appendChild(input);
                break;
            case "textarea":
                const textarea = document.createElement("textarea");
                textarea.placeholder = field.label;
                container.appendChild(textarea);
                break;
            case "select":
                const select = document.createElement("select");
                (_a = field.options) === null || _a === void 0 ? void 0 : _a.forEach((option) => {
                    const opt = document.createElement("option");
                    opt.value = option;
                    opt.textContent = option;
                    select.appendChild(opt);
                });
                container.appendChild(select);
                break;
            case "radio":
            case "checkbox":
                (_b = field.options) === null || _b === void 0 ? void 0 : _b.forEach((option) => {
                    const input = document.createElement("input");
                    input.type = field.type;
                    input.name = field.label;
                    input.value = option;
                    const label = document.createElement("label");
                    label.textContent = option;
                    label.prepend(input);
                    container.appendChild(label);
                });
                break;
        }
        const removeFieldBtn = document.createElement("button");
        removeFieldBtn.textContent = "Remove Field";
        removeFieldBtn.className = "remove-field";
        removeFieldBtn.addEventListener("click", () => {
            this.removeField(field.id);
        });
        container.appendChild(removeFieldBtn);
    }
    removeField(fieldId) {
        const formIndex = this.forms.findIndex((form) => form.id === this.currentFormId);
        if (formIndex >= 0) {
            this.forms[formIndex].fields = this.forms[formIndex].fields.filter((field) => field.id !== fieldId);
            this.renderFormFields();
        }
    }
    loadForms() {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                const form = localStorage.getItem(key);
                if (form) {
                    this.forms.push(JSON.parse(form));
                }
            }
        }
    }
    generateId() {
        return "id-" + Math.random().toString(36).substr(2, 16);
    }
}
document.addEventListener("DOMContentLoaded", () => {
    new FormManager();
});
