describe('Not Found Component', () => {

    it('should input a non-existent URL and see the Not Found component', () => {
        cy.visit('http://localhost:5173/non-existent-url');

        const notFoundComponent = cy.get('body');
        notFoundComponent.should('exist');

        const notFoundTitle = notFoundComponent.find('h1');
        notFoundTitle.should('have.text', '404');

        const notFoundMessage = notFoundComponent.get('p');
        notFoundMessage.should('have.text', 'Oops! Page not found.');
    });

    it('should click on the Home button and see the Home component', () => {
        cy.visit('http://localhost:5173/non-existent-url');

        const notFoundComponent = cy.get('body');

        const notFoundButton = notFoundComponent.get('button').contains('Home');
        notFoundButton.should('have.text', 'Home');

        notFoundButton.click();
        cy.url().should('eq', 'http://localhost:5173/');

        const homePageTitle = cy.get('h1');
        homePageTitle.should('have.text', 'Welcome to the TPA Manager! ');
    });

    it('should click on the Back button and see the previous page', () => {
        cy.visit('http://localhost:5173/catalogue');
        cy.visit('http://localhost:5173/non-existent-url');

        const notFoundComponent = cy.get('body');

        const notFoundButton = notFoundComponent.get('button').contains('Back');
        notFoundButton.should('have.text', 'Back');

        notFoundButton.click();
        cy.url().should('eq', 'http://localhost:5173/catalogue');

        const homePageTitle = cy.get('h1');
        homePageTitle.should('have.text', '📖 TPs Catalogue');
    });
});