describe('Check if "sign in" button is working and lead to game window', () => {
    it('should set overlay opacity to 1 and then decrease it to 0, while changing the active scene in background', () => {
        cy.visit('http://localhost:2000');

        cy.get('#playGame').click({force: true});
        cy.wait(500);
        cy.get('#overlay').should('not.have.css', 'opacity', '0');
        cy.wait(4600);
        cy.wait(4500);
        cy.get('#overlay').should('have.css', 'opacity', '0');
    });
});