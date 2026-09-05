/** §10 targets, verbatim from the spec's table. */
export type CrossRefAsset = {id: string; file: string; title: string; timestamp?: string; variant: number};

export const crossrefs: CrossRefAsset[] = [
  {id: 'RC-XREF-WELTEDPOCKET', file: 'RC_XREF_WELTEDPOCKET', title: 'Welted pocket tutorial', variant: 0},
  {id: 'RC-XREF-KEYSTONEFLY', file: 'RC_XREF_KEYSTONEFLY', title: 'Keystone Denims fly', variant: 1},
  {id: 'RC-XREF-AEROITALY', file: 'RC_XREF_AEROITALY', title: 'Aero build in Italy', variant: 2},
  {id: 'RC-XREF-HELPPAGE', file: 'RC_XREF_HELPPAGE', title: 'Printing / tiling help page', variant: 3},
  {id: 'RC-XREF-POVVERSION', file: 'RC_XREF_POVVERSION', title: 'The POV cut of this build', variant: 4},
  {id: 'RC-XREF-LONGVERSION', file: 'RC_XREF_LONGVERSION', title: 'The full workshop cut', variant: 5},
  // §10: "Already know the pattern system? Skip to <chapter>." Jack asks for
  // this timestamp verbally in most builds, so it is a prop.
  {id: 'RC-XREF-SKIPAHEAD', file: 'RC_XREF_SKIPAHEAD', title: 'Know the pattern system?', timestamp: '00:00', variant: 6},
];
