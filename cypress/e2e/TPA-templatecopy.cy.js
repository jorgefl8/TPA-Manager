beforeEach(() => {
  cy.intercept("GET", Cypress.env("REGISTRY_URL") + "/api/v6/templates", {
    fixture: "templates.json",
  }).as("templatesCheck");
  cy.intercept("POST", Cypress.env("REGISTRY_URL") + "/api/v6/templates", {
    fixture: "template_cloned.json",
  }).as("cloneTemplateCheck");

  cy.visit(Cypress.env("BASE_URL"));
});
describe("Navigate to templates-management and create template from sample", () => {
  it("should navigate to templates-management and create new template", () => {
    cy.get("button").contains("Templates Management").click();
    cy.url().should("eq", Cypress.env("BASE_URL") + "/templates-management");
    cy.get("button")
      .contains("Create new template from sample")
      .should("be.visible")
      .click();
    cy.get(".p-inputtext").type("template-test_showcase-v1-0-0");
    cy.wait("@cloneTemplateCheck");
    cy.get(".p-toast-message").should(
      "contain",
      "Template added successfully."
    );
  });
});
describe("Display templates", () => {
  it("should navigate to templates-management and display the templates", () => {
    cy.get("button").contains("Templates Management").click();
    cy.url().should("eq", Cypress.env("BASE_URL") + "/templates-management");
    cy.wait("@templatesCheck");
    cy.get(".template-card .text-header").contains(
      "template-test_showcase-v1-0-0"
    );
  });
});

describe("Clone TPA template", () => {
  it("click on TPA template clone and should see it created", () => {
    const toggleRoot = cy.get(".node-root-content span").contains("Courses");
    toggleRoot.click();
    const toggleCourse = cy.get("span").contains("test-course");
    toggleCourse.click();
    cy.contains("div", "test-project-with-tpa").within(() => {
      cy.get("button").contains("TPA").click();
    });
    cy.wait("@tpaCheck");
    cy.get(".p-breadcrumb-list").contains("test-course");
  });
});

describe("Display TPA template in visualize mode", () => {
  it("click on TPA button and try to edit", () => {
    const toggleRoot = cy.get(".node-root-content span").contains("Courses");
    toggleRoot.click();
    const toggleCourse = cy.get("span").contains("test-course");
    toggleCourse.click();
    cy.contains("div", "test-project-with-tpa").within(() => {
      cy.get("button").contains("TPA").click();
    });
    cy.wait("@tpaCheck");
    cy.get(".p-breadcrumb-list").contains("test-course");
  });
});
