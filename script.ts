// interface for the fields to ensure the strict type.
interface Field {
  id: string;
  label: string;
  type:
    | "text"
    | "number"
    | "email"
    | "select"
    | "textarea"
    | "radio"
    | "checkbox";
  options?: string[];
}

interface Form {
  id: string;
  title: string;
  fields: Field[];
}

// Class for managing forms and their functionality.
class FormManager {
  private forms: Form[] = [];
  private currentFormId: string | null = null;
  private responses: { [key: string]: any } = {};

  constructor() {
    this.loadForms();
    this.renderFormsList();
    this.bindEvents();
  }

  // Listeners are here
  private bindEvents(): void {
    document
      .getElementById("createFormBtn")
      ?.addEventListener("click", () => this.createForm());
    document
      .getElementById("addFieldBtn")
      ?.addEventListener("click", () => this.addField());
    document
      .getElementById("saveFormBtn")
      ?.addEventListener("click", () => this.saveForm());
  }

  private createForm(): void {
    const formTitle = prompt("Enter form title:", "New Form");
    if (formTitle) {
      const newForm: Form = {
        id: this.generateId(),
        title: formTitle,
        fields: [],
      };
      this.forms.push(newForm);
      this.currentFormId = newForm.id;
      this.renderForm();
      document.getElementById("saveFormBtn")?.classList.remove("hidden"); // to showing the save button.
    }
  }

  private addField(): void {
    if (this.currentFormId) {
      const fieldType = prompt(
        "Enter field type (text, email, number, select, textarea, radio, checkbox):",
        "text"
      );
      const fieldLabel = prompt("Enter field label:", "Field Label");
      let options: string[] | undefined;

      if (
        fieldType === "select" ||
        fieldType === "radio" ||
        fieldType === "checkbox"
      ) {
        options = this.getOptions();
      }

      if (fieldType && fieldLabel) {
        const newField: Field = {
          id: this.generateId(),
          label: fieldLabel,
          type: fieldType as Field["type"],
          options: options,
        };
        const formIndex = this.forms.findIndex(
          (form) => form.id === this.currentFormId
        );
        if (formIndex !== -1) {
          this.forms[formIndex].fields.push(newField);
          this.renderFormFields();
        }
      }
    }
  }

  private getOptions(): string[] {
    const options = prompt(
      "Enter options separated by commas:",
      "Option 1, Option 2"
    );
    return options ? options.split(",").map((option) => option.trim()) : [];
  }

  private saveForm(): void {
    if (this.currentFormId) {
      const formIndex = this.forms.findIndex(
        (form) => form.id === this.currentFormId
      );
      if (formIndex !== -1) {
        const form = this.forms[formIndex];
        localStorage.setItem(form.id, JSON.stringify(form));
        alert("Form saved!");
        this.renderFormsList(); // Update the forms list.
        this.clearFormFields(); // Clearing the form fields
        document.getElementById("saveFormBtn")?.classList.add("hidden"); // Hide save button
      }
    }
  }

  private clearFormFields(): void {
    const formFields = document.getElementById("formFields");
    if (formFields) {
      formFields.innerHTML = "";
    }
  }

  private renderFormsList(): void {
    const formList = document.getElementById("formList");
    formList!.innerHTML = "";
    this.forms.forEach((form) => {
      const formItem = document.createElement("div");
      formItem.textContent = form.title;
      formItem.addEventListener("click", () => this.loadForm(form.id));
      formList!.appendChild(formItem);
    });
  }

  // Load the specific for mby ID.
  private loadForm(formId: string): void {
    const form = this.forms.find((f) => f.id === formId);
    if (form) {
      this.currentFormId = formId;
      this.renderForm();
    }
  }

  private renderForm(): void {
    document.getElementById("formTitle")!.textContent =
      this.forms.find((f) => f.id === this.currentFormId)?.title || "Form";
    this.renderFormFields();
    this.renderSubmitButton();
    document.getElementById("formArea")!.classList.remove("hidden");
  }

  private renderFormFields(): void {
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

  // this function will render the submit button dynamically.
  private renderSubmitButton(): void {
    const formContainer = document.getElementById("formArea");
    if (formContainer) {
      const existingSubmitButton =
        formContainer.querySelector(".submit-button");
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

  private submitForm(): void {
    const form = this.forms.find((f) => f.id === this.currentFormId);
    if (form) {
      const responses: { [key: string]: any } = {};
      form.fields.forEach((field) => {
        const fieldContainer = document.querySelector(
          `.field-container label:contains('${field.label}')`
        )?.parentElement;
        if (fieldContainer) {
          switch (field.type) {
            case "text":
            case "email":
            case "number":
              const input = fieldContainer.querySelector(
                "input"
              ) as HTMLInputElement;
              responses[field.id] = input ? input.value : "";
              break;
            case "textarea":
              const textarea = fieldContainer.querySelector(
                "textarea"
              ) as HTMLTextAreaElement;
              responses[field.id] = textarea ? textarea.value : "";
              break;
            case "select":
              const select = fieldContainer.querySelector(
                "select"
              ) as HTMLSelectElement;
              responses[field.id] = select ? select.value : "";
              break;
            case "radio":
            case "checkbox":
              const checkedInputs = fieldContainer.querySelectorAll(
                `input[type='${field.type}']:checked`
              );
              responses[field.id] = Array.from(checkedInputs).map(
                (input) => input.value
              );
              break;
          }
        }
      });
      this.responses[form.id] = responses;

      const allResponses = JSON.parse(
        localStorage.getItem("allResponses") || "{}"
      );
      allResponses[form.id] = allResponses[form.id] || [];
      allResponses[form.id].push(responses);
      localStorage.setItem("allResponses", JSON.stringify(allResponses));

      this.displayResponses(responses);

      alert("Form submitted successfully!");
    }
  }

  private displayResponses(responses: { [key: string]: any }): void {
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

      console.log(
        "Stored Responses:",
        JSON.parse(localStorage.getItem("allResponses") || "{}")
      ); // Console the stored response
    }
  }

  private createFieldElement(field: Field, container: HTMLElement): void {
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
        field.options?.forEach((option) => {
          const opt = document.createElement("option");
          opt.value = option;
          opt.textContent = option;
          select.appendChild(opt);
        });
        container.appendChild(select);
        break;
      case "radio":
      case "checkbox":
        field.options?.forEach((option) => {
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

  private removeField(fieldId: string): void {
    const formIndex = this.forms.findIndex(
      (form) => form.id === this.currentFormId
    );
    if (formIndex >= 0) {
      this.forms[formIndex].fields = this.forms[formIndex].fields.filter(
        (field) => field.id !== fieldId
      ); // Filtered the removed field
      this.renderFormFields();
    }
  }

  private loadForms(): void {
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

  private generateId(): string {
    return "id-" + Math.random().toString(36).substr(2, 16);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new FormManager();
});
