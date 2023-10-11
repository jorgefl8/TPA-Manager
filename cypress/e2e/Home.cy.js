beforeEach(() => {
    cy.intercept('GET', Cypress.env("SCOPE_MANAGER_URL") + '/api/v1/scopes/development/courses', { fixture: 'courses.json' }).as('coursesCheck');
    cy.intercept('GET', Cypress.env("REGISTRY_URL") + '/api/v6/agreements', { fixture: 'agreements.json' }).as('agreementsCheck');
    cy.intercept('GET', Cypress.env("REGISTRY_URL") + '/api/v6/agreements/tpa-*', { fixture: 'tpa.json' }).as('tpaCheck');

    cy.visit(Cypress.env('BASE_URL'));
});

describe('Basic Home logic', () => {
    it('should see the Home component', () => {
        const homePageTitle = cy.get('h1');
        homePageTitle.should('have.text', 'Welcome to the TPA Designer! ');
    });
});

describe('Catalogue Home logic', () => {
    it('should click on the Catalogue button and see the Catalogue component', () => {
        const catalogueButton = cy.get('button').contains('Catalogue');

        catalogueButton.click();
        cy.url().should('eq', Cypress.env('BASE_URL') + '/catalogue');

        const cataloguePageTitle = cy.get('h1');
        cataloguePageTitle.should('have.text', '📖 TPs Catalogue');
    });
});

describe('Create Home logic', () => {
    it('should click on the Create button and see the SelectTpa component on its Dialog form', () => {
        const createButton = cy.get('button').contains('Create');
        createButton.click();

        const selectTPATitle = cy.get('h2');
        selectTPATitle.should('have.text', 'Select a course');
    });

    it('should click on the Create button and be able to select a course and a project without a TPA', () => {
        const createButton = cy.get('button').contains('Create');
        createButton.click();

        const selectCourseDropdown = cy.get('span.p-dropdown-label').contains('Select a course');
        selectCourseDropdown.click();

        const course = cy.get('li').contains('test-course');
        course.click();

        const selectProjectDropdown = cy.get('span.p-dropdown-label').contains('Select a project');
        selectProjectDropdown.click();

        const project = cy.get('li').contains('test-project-without-tpa');
        project.click();

        const switchToEditionAfterCreationCheckbox = cy.get('div.p-checkbox')
        switchToEditionAfterCreationCheckbox.click();
        switchToEditionAfterCreationCheckbox.should('have.class', 'p-checkbox-checked');
        switchToEditionAfterCreationCheckbox.next().contains('Switch to edition mode after creation?');
    });
});

describe('Delete Home logic', () => {
    it('should click on the Delete button and see the SelectTpa component on its Dialog form', () => {
        const deleteButton = cy.get('button').contains('Delete');
        deleteButton.click();

        const selectTPATitle = cy.get('h2');
        selectTPATitle.should('have.text', 'Select a course');
    });

    it('should click on the Delete button and be able to select a course and a project with a TPA', () => {
        const deleteButton = cy.get('button').contains('Delete');
        deleteButton.click();

        const selectCourseDropdown = cy.get('span.p-dropdown-label').contains('Select a course');
        selectCourseDropdown.click();

        const course = cy.get('li').contains('test-course');
        course.click();

        const selectProjectDropdown = cy.get('span.p-dropdown-label').contains('Select a project');
        selectProjectDropdown.click();

        const project = cy.get('li').contains('test-project-with-tpa');
        project.click();
    });
});

describe('Display Home logic', () => {
    it('should click on the Display button and see the SelectTpa component on its Dialog form', () => {
        const displayButton = cy.get('button').contains('Display');
        displayButton.click();

        const selectTPATitle = cy.get('h2');
        selectTPATitle.should('have.text', 'Select a course');
    });

    it('should click on the Edit button and be able display a project with a TPA', () => {
        const displayButton = cy.get('button').contains('Display');
        displayButton.click();

        const selectCourseDropdown = cy.get('span.p-dropdown-label').contains('Select a course');
        selectCourseDropdown.click();

        const course = cy.get('li').contains('test-course');
        course.click();

        const selectProjectDropdown = cy.get('span.p-dropdown-label').contains('Select a project');
        selectProjectDropdown.click();

        const project = cy.get('li').contains('test-project-with-tpa');
        project.click();

        const displayAgreementButton = cy.get('button').contains('Display agreement');
        displayAgreementButton.click();

        cy.url().should('eq', Cypress.env('BASE_URL') + '/visualization/test-course/test-project-with-tpa');

        const displayAgreementTitle = cy.get('h3');
        displayAgreementTitle.should('have.text', '🔍 Visualization');
    });
});

describe('Edit Home logic', () => {
    it('should click on the Edit button and see the SelectTpa component on its Dialog form', () => {
        const editButton = cy.get('button').contains('Edit');
        editButton.click();

        const selectTPATitle = cy.get('h2');
        selectTPATitle.should('have.text', 'Select a course');
    });

    it('should click on the Edit button and be able edit a project with a TPA', () => {
        const editButton = cy.get('button').contains('Edit');
        editButton.click();

        const selectCourseDropdown = cy.get('span.p-dropdown-label').contains('Select a course');
        selectCourseDropdown.click();

        const course = cy.get('li').contains('test-course');
        course.click();

        const selectProjectDropdown = cy.get('span.p-dropdown-label').contains('Select a project');
        selectProjectDropdown.click();

        const project = cy.get('li').contains('test-project-with-tpa');
        project.click();

        const editAgreementButton = cy.get('button').contains('Edit agreement');
        editAgreementButton.click();

        cy.url().should('eq', Cypress.env('BASE_URL') + '/edition/test-course/test-project-with-tpa');

        const displayAgreementTitle = cy.get('h3');
        displayAgreementTitle.should('have.text', '✏️ Edition');
    });
});