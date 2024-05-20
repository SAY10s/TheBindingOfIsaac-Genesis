describe('Check if page displays without horizontal scroll', () => {
    it('should display the page without horizontal scroll', () => {
        cy.visit('http://localhost:2000'); // replace 'your-url' with the URL of your page

        cy.window().then((win) => {
            cy.document().then((doc) => {
                expect(doc.documentElement.scrollWidth).to.be.lte(win.innerWidth);
            });
        });
    });
});