
import vtkFullScreenRenderWindow from 'vtk.js/Sources/Rendering/Misc/FullScreenRenderWindow';
import vtkActor           from 'vtk.js/Sources/Rendering/Core/Actor';
import vtkLookupTable     from 'vtk.js/Sources/Common/Core/LookupTable';
import vtkMapper          from 'vtk.js/Sources/Rendering/Core/Mapper';
import { ColorMode, ScalarMode }  from 'vtk.js/Sources/Rendering/Core/Mapper/Constants';
import { AttributeTypes } from 'vtk.js/Sources/Common/DataModel/DataSetAttributes/Constants';
import { FieldDataTypes } from 'vtk.js/Sources/Common/DataModel/DataSet/Constants';
import vtkHttpDataSetReader       from 'vtk.js/Sources/IO/Core/HttpDataSetReader';
import vtkInteractorStyleTrackballCamera from 'vtk.js/Sources/Interaction/Style/InteractorStyleTrackballCamera'
import controlPanel from './controller.html';
// ----------------------------------------------------------------------------
// Standard rendering code setup
// ----------------------------------------------------------------------------
const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance();
const renderer = fullScreenRenderer.getRenderer();
const renderWindow = fullScreenRenderer.getRenderWindow();

// -------------
// DataSetReader
// -------------
const reader = vtkHttpDataSetReader.newInstance({ enableArray: true, fetchGzip: true });
reader.setUrl(`./data/square_1e2_neumann_pcs_0_ts_1_t_1.000000.vtu`).then((reader, dataset) => {
  console.log('Metadata loaded with the geometry', dataset);

  reader.loadData().then((reader, dataset) =>{
    reader.getArrays().forEach(array => {
      console.log('-', array.name, array.location, ':', array.enable);
    });
  });



  // reader.update()
  //   .then((reader, dataset) => {
  //     console.log('dataset fully loaded', dataset);
  //   });
});

const lookupTable = vtkLookupTable.newInstance({
  mappingRange: [1.0, 1.7],

});

const mapper = vtkMapper.newInstance({
  interpolateScalarsBeforeMapping: true,
  colorMode: ColorMode.MAP_SCALARS,
  scalarMode: ScalarMode.USE_POINT_DATA,
  useLookupTableScalarRange: true,
  scalarVisibility: true,
  lookupTable,
});
mapper.setInputConnection(reader.getOutputPort());

const actor = vtkActor.newInstance();
var property = actor.getProperty();
property.setEdgeVisibility(true);

actor.setMapper(mapper);
renderer.addActor(actor);

renderer.resetCamera();
renderWindow.render();


// -----------------------------------------------------------
// UI control handling
// -----------------------------------------------------------
fullScreenRenderer.addController(controlPanel);
const representationSelector = document.querySelector('.representations');
const resolutionChange = document.querySelector('.resolution');
representationSelector.addEventListener('change', (e) => {
  const newRepValue = Number(e.target.value);
  actor.getProperty().setRepresentation(newRepValue);
  renderWindow.render();
});
resolutionChange.addEventListener('input', (e) => {
  const value = Number(e.target.value);
  actor.getProperty().setOpacity(value / 100.0)
  renderWindow.render();
});

// -----------------------------------------------------------
// globals for inspecting
// -----------------------------------------------------------
global.mapper = mapper;
global.actor = actor;
global.renderer = renderer;
global.renderWindow = renderWindow;

global.lut = lookupTable;
