beforeEach(() => {
    cy.intercept('POST', Cypress.env("SCOPE_MANAGER_URL") + '/api/v1/scopes/development/courses', { fixture: 'new-course.json' }).as('coursesCheck');
    cy.visit(Cypress.env('BASE_URL')+'/new-course');
});

describe('Correct Title', () => {
    it('should see the New Course component', () => {
        const homePageTitle = cy.get('.header-top > span');
        homePageTitle.should('have.text', 'Create new Course');
    });
});

describe('Create Course', () => {
    it('fills the form and creates a course with success message', () => {
        cy.get('#class-name').type('New-course-name');
        cy.get('#join-code').type('12345');
        cy.get('.p-button').contains('Create').click();
        cy.get('.p-toast-message').should('contain', 'Course created successfully!');
    });
});


