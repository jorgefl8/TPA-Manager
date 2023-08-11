describe('Change App Theme', () => {
  it('should change the theme to dark mode and back to light mode', () => { 
    cy.visit(Cypress.env('BASE_URL'));
    
    const toggleThemeButton = cy.get('button.right-0');
    const themeIcon = toggleThemeButton.find('span.p-button-icon');
    themeIcon.should('have.class', 'pi-sun');

    toggleThemeButton.click();
    themeIcon.should('have.class', 'pi-moon');

    toggleThemeButton.click();
    themeIcon.should('have.class', 'pi-sun');
  });
});