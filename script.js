// // Defining the interface for a field in the form
// interface Field {
//   id: string;
//   label: string;
//   type: "text" | "number" | "email" | "select" | "textarea";
//   options?: string[]; // Options for select fields
// }
// Class to manage forms and their operations
var FormManager = /** @class */ (function () {
    function FormManager() {
        this.forms = []; // Array to hold the forms
        this.currentFormId = null; // ID of the currently loaded form
        this.loadForms(); // Load existing forms from local storage
        this.renderFormsList(); // Render the list of forms
        this.bindEvents(); // Bind event listeners
    }
    // Method to bind event listeners
    FormManager.prototype.bindEvents = function () {
        var _this = this;
        var _a, _b, _c;
        (_a = document
            .getElementById("createFormBtn")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", function () { return _this.createForm(); });
        (_b = document
            .getElementById("addFieldBtn")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", function () { return _this.addField(); });
        (_c = document
            .getElementById("saveFormBtn")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", function () { return _this.saveForm(); });
    };
    // Method to create a new form
    FormManager.prototype.createForm = function () {
        var formTitle = prompt("Enter form title:", "New Form");
        if (formTitle) {
            var newForm = {
                id: this.generateId(),
                title: formTitle,
                fields: [], // Initialize with no fields
            };
            this.forms.push(newForm); // Add the new form to the forms array
            this.currentFormId = newForm.id; // Set the current form ID
            this.renderForm(); // Render the new form
        }
    };
    // Method to add a new field to the current form
    FormManager.prototype.addField = function () {
        var _this = this;
        if (this.currentFormId) {
            var fieldType = prompt("Enter field type (text, email, number, select, textarea, radio, checkbox):", "text");
            var fieldLabel = prompt("Enter field label:", "Field Label");
            if (fieldType && fieldLabel) {
                var newField = {
                    id: this.generateId(),
                    label: fieldLabel,
                    type: fieldType, // Type assertion
                    options: fieldType === "radio" || fieldType === "checkbox"
                        ? this.getOptions()
                        : undefined,
                };
                var formIndex = this.forms.findIndex(function (form) { return form.id === _this.currentFormId; });
                if (formIndex !== -1) {
                    // Ensure formIndex is valid
                    this.forms[formIndex].fields.push(newField); // Add the new field to the current form
                    this.renderFormFields(); // Render the fields of the current form
                }
            }
        }
    };
    // Method to get options for select fields, radio buttons, and checkboxes
    FormManager.prototype.getOptions = function () {
        var options = prompt("Enter options separated by commas:", "Option 1, Option 2");
        return options ? options.split(",").map(function (option) { return option.trim(); }) : [];
    };
    // Method to save the current form to local storage
    FormManager.prototype.saveForm = function () {
        var _this = this;
        if (this.currentFormId) {
            var formIndex = this.forms.findIndex(function (form) { return form.id === _this.currentFormId; });
            if (formIndex !== -1) {
                // Ensure formIndex is valid
                var form = this.forms[formIndex];
                localStorage.setItem(form.id, JSON.stringify(form)); // Save form as JSON string
                alert("Form saved!");
                this.renderFormsList(); // Refresh the list of forms
            }
        }
    };
    // Method to render the list of forms
    FormManager.prototype.renderFormsList = function () {
        var _this = this;
        var formList = document.getElementById("formList");
        formList.innerHTML = ""; // Clear existing list
        this.forms.forEach(function (form) {
            var formItem = document.createElement("div");
            formItem.textContent = form.title; // Display form title
            formItem.addEventListener("click", function () { return _this.loadForm(form.id); }); // Load form on click
            formList.appendChild(formItem); // Append to form list
        });
    };
    // Method to load a specific form by ID
    FormManager.prototype.loadForm = function (formId) {
        var form = this.forms.find(function (f) { return f.id === formId; });
        if (form) {
            this.currentFormId = formId; // Set the current form ID
            this.renderForm(); // Render the loaded form
        }
    };
    // Method to render the currently loaded form
    FormManager.prototype.renderForm = function () {
        var _this = this;
        var _a;
        document.getElementById("formTitle").textContent =
            ((_a = this.forms.find(function (f) { return f.id === _this.currentFormId; })) === null || _a === void 0 ? void 0 : _a.title) || "Form";
        this.renderFormFields(); // Render fields of the current form
        document.getElementById("formArea").classList.remove("hidden"); // Show form area
    };
    // Method to render fields of the current form
    FormManager.prototype.renderFormFields = function () {
        var _this = this;
        var formFields = document.getElementById("formFields");
        if (formFields) {
            formFields.innerHTML = ""; // Clear existing fields
            var form = this.forms.find(function (f) { return f.id === _this.currentFormId; });
            if (form) {
                form.fields.forEach(function (field) {
                    var fieldContainer = document.createElement("div");
                    fieldContainer.className = "field-container";
                    var label = document.createElement("label");
                    label.textContent = field.label; // Set field label
                    fieldContainer.appendChild(label); // Append label
                    // Create input elements based on field type
                    _this.createFieldElement(field, fieldContainer);
                    formFields.appendChild(fieldContainer); // Append field container
                });
            }
        }
    };
    // Method to create input elements based on field type
    FormManager.prototype.createFieldElement = function (field, container) {
        var _this = this;
        var _a, _b;
        switch (field.type) {
            case "text":
            case "email":
            case "number":
                var input = document.createElement("input");
                input.type = field.type; // Set input type
                input.placeholder = field.label; // Set placeholder
                container.appendChild(input); // Append input to container
                break;
            case "textarea":
                var textarea = document.createElement("textarea");
                textarea.placeholder = field.label; // Set placeholder
                container.appendChild(textarea); // Append textarea to container
                break;
            case "select":
                var select_1 = document.createElement("select");
                (_a = field.options) === null || _a === void 0 ? void 0 : _a.forEach(function (option) {
                    var opt = document.createElement("option");
                    opt.value = option;
                    opt.textContent = option; // Set option text
                    select_1.appendChild(opt); // Append option to select
                });
                container.appendChild(select_1); // Append select to container
                break;
            case "radio":
            case "checkbox":
                (_b = field.options) === null || _b === void 0 ? void 0 : _b.forEach(function (option) {
                    var input = document.createElement("input");
                    input.type = field.type; // Set input type (radio or checkbox)
                    input.name = field.label; // Group radio buttons by label
                    input.value = option; // Set value
                    var label = document.createElement("label");
                    label.textContent = option; // Set label text
                    label.prepend(input); // Place input before label text
                    container.appendChild(label); // Append label (with input) to container
                });
                break;
        }
        // Button to remove the field
        var removeFieldBtn = document.createElement("button");
        removeFieldBtn.textContent = "Remove Field";
        removeFieldBtn.className = "remove-field";
        removeFieldBtn.addEventListener("click", function () {
            _this.removeField(field.id); // Remove field on button click
        });
        container.appendChild(removeFieldBtn); // Append button to container
    };
    // Method to remove a field from the current form
    FormManager.prototype.removeField = function (fieldId) {
        var _this = this;
        var formIndex = this.forms.findIndex(function (form) { return form.id === _this.currentFormId; });
        if (formIndex >= 0) {
            this.forms[formIndex].fields = this.forms[formIndex].fields.filter(function (field) { return field.id !== fieldId; }); // Filter out the removed field
            this.renderFormFields(); // Re-render fields
        }
    };
    // Method to load forms from local storage
    FormManager.prototype.loadForms = function () {
        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            if (key) {
                var form = localStorage.getItem(key);
                if (form) {
                    this.forms.push(JSON.parse(form)); // Parse and push form to the array
                }
            }
        }
    };
    // Method to generate a unique ID
    FormManager.prototype.generateId = function () {
        return "id-" + Math.random().toString(36).substr(2, 16); // Generate a random ID
    };
    return FormManager;
}());
// Initialize the FormManager when the DOM content is loaded
document.addEventListener("DOMContentLoaded", function () {
    new FormManager();
});
