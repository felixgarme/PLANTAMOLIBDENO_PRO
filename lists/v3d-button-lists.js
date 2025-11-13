

// ---------------------- LISTAS ----------------------
(function(){
  function init(){
    if(typeof window.createV3DButtonList!=='function'){
      console.warn('createV3DButtonList no está listo, reintentando...');
      return setTimeout(init,100);
    }

    // ----- Botones VA -----
    const botonesVA=[
      {texto:'Entrada Lavado de Gases',proc:'vA1'},
      {texto:'Cartel Lavado de Gases',proc:'vA2'},
      {texto:'Tanques de Nash',proc:'vA3'},
      {texto:'Cartel Tanques de Nash',proc:'vA4'},
      {texto:'Zona de Ácido',proc:'vA6'},
      {texto:'Zona de Ácido cartel',proc:'vA5'},//
     
    ];
    window.createV3DButtonList('VA',botonesVA,{
      containerId:'miContenedorBotonesVA',
      nextButtonId:'v3d-next-button-VA',
      mainContainerId:'v3d-container'
    });

    // ----- Botones VB -----
    const botonesVB=[
      {texto:'Ducha 1 (Visual)',proc:'vB1'},
      {texto:'Ducha 2',proc:'vB2'},
      {texto:'Ducha 3',proc:'vB3'},
      {texto:'Ducha 4',proc:'vB4'},
      {texto:'Ducha 5',proc:'vB5'},
      {texto:'Ducha 6',proc:'vB6'},
      {texto:'Ducha 7',proc:'vB7'},
      {texto:'Ducha 8',proc:'vB8'},
      {texto:'Vista General',proc:'vBx'}
    ];
    window.createV3DButtonList('VB',botonesVB,{
      containerId:'miContenedorBotonesVB',
      nextButtonId:'v3d-next-button-VB',
      mainContainerId:'v3d-container'
    });

    // ----- Botones VC -----
    const botonesVC=[
      {texto:'Zona 1',proc:'vC1'},
      {texto:'Zona 2',proc:'vC2'},
      {texto:'Zona 3',proc:'vC3'},
      {texto:'Zona 4',proc:'vC4'},
      {texto:'Vista General',proc:'vCx'}
    ];
    window.createV3DButtonList('VC',botonesVC,{
      containerId:'miContenedorBotonesVC',
      nextButtonId:'v3d-next-button-VC',
      mainContainerId:'v3d-container'
    });

    // ----- NUEVO: Botones VD -----
    const botonesVD=[
      {texto:'Evacuación 1',proc:'vD1'},
      {texto:'Evacuación 2',proc:'vD2'},

    ];
    window.createV3DButtonList('VD',botonesVD,{
      containerId:'miContenedorBotonesVD',
      nextButtonId:'v3d-next-button-VD',
      mainContainerId:'v3d-container'
    });
    // ----- FIN VD -----

    // Importante: Asegúrate que 'VA' sea la lista inicial
    window.toggleBotonesV3D('VA',true); 
    
    console.log('Listas VA, VB, VC y VD creadas correctamente.');
  }

  if(document.readyState==='loading')
    document.addEventListener('DOMContentLoaded',init);
  else init();
})();

// // ---------------------- LISTAS ----------------------
// (function(){
//   function init(){
//     if(typeof window.createV3DButtonList!=='function'){
//       console.warn('createV3DButtonList no está listo, reintentando...');
//       return setTimeout(init,100);
//     }
//     //Botones VA
//     const botonesVA=[
//       {texto:'Entrada',proc:'vA1'},
//       {texto:'Lavado de gases',proc:'vA2'},
//       {texto:'Tanques de Nash',proc:'vA3'},
//       {texto:'Tanques de Nash cartel',proc:'vA4'},
//       {texto:'Zona de Ácido cartel',proc:'vA5'},
//       {texto:'Zona de Ácido',proc:'vA6'}
//     ];
//     window.createV3DButtonList('VA',botonesVA,{
//       containerId:'miContenedorBotonesVA',
//       nextButtonId:'v3d-next-button-VA',
//       mainContainerId:'v3d-container'
//     });
//     //Botones VB
//     const botonesVB=[
//       {texto:'Ducha 1',proc:'vB1'},
//       {texto:'Ducha 2',proc:'vB2'},
//       {texto:'Ducha 3',proc:'vB3'},
//       {texto:'Ducha 4',proc:'vB4'},
//       {texto:'Ducha 5',proc:'vB5'},
//       {texto:'Ducha 6',proc:'vB6'},
//       {texto:'Ducha 7',proc:'vB7'},
//       {texto:'Ducha 8',proc:'vB8'},
//       {texto:'Vista General',proc:'vBx'}
//     ];
//     window.createV3DButtonList('VB',botonesVB,{
//       containerId:'miContenedorBotonesVB',
//       nextButtonId:'v3d-next-button-VB',
//       mainContainerId:'v3d-container'
//     });

//     // ----- NUEVO: Botones VC -----
//     const botonesVC=[
//       {texto:'Zona 1',proc:'vC1'},
//       {texto:'Zona 2',proc:'vC2'},
//       {texto:'Zona 3',proc:'vC3'},
//       {texto:'Zona 4',proc:'vC4'},
//       {texto:'Vista General',proc:'vCx'}
//     ];
//     window.createV3DButtonList('VC',botonesVC,{
//       containerId:'miContenedorBotonesVC',
//       nextButtonId:'v3d-next-button-VC',
//       mainContainerId:'v3d-container'
//     });
//     // ----- FIN DE LO NUEVO -----


//     // Importante: Asegúrate que 'VA' sea la lista inicial
//     // y que coincida con v3dListOrder[0] del script principal.
//     window.toggleBotonesV3D('VA',true); 
    
//     // MODIFICADO:
//     console.log('Listas VA, VB y VC creadas correctamente.');
//   }

//   if(document.readyState==='loading')
//     document.addEventListener('DOMContentLoaded',init);
//   else init();
// })();