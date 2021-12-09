describe('GlPopover', () => {
  it('popover title should be visible when using props', () => {
    cy.visitStory('popover');

    cy.get('[data-testid="popover-with-props"]').contains('Popover');
  });

  it('popover title should be visible when using scoped slot', () => {
    cy.visit('iframe.html?id=base-popover--on-click&viewMode=story');

    cy.get('[data-testid="popover-button-click"]').click();

    cy.get('[data-testid="popover-title"]').should('be.visible').contains('Popover title');
  });
});