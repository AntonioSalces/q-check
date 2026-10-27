import { single } from "./helpers";
import type { Question } from "./types";

/** Tema 10 y anexo: diseño y defectos de piezas fundidas. Numeración original 58-67. */
export const b3: Question[] = [
  single(
    "b3",
    58,
    "¿Cuál de estos grupos corresponde a los defectos de porosidad y contracción en piezas fundidas?",
    [
      "Deformaciones, aplastamientos, hundimientos, empujes, rebabas y movimientos de las cajas",
      "Soldaduras e intermitencias, piezas no llenas y discontinuidades, arranques de partes del molde, escapes de metal, falta de metal, hendiduras, grietas y roturas",
      "Aspecto basto, hinchazones, abombamientos, penetraciones, exfoliaciones, inclusiones de arena y dartas",
      "Porosidades, pequeños agujeros, burbujas, sopladuras, rechupes, contracciones, meniscos, tensiones y grietas",
    ],
    3,
  ),
  single(
    "b3",
    59,
    "Indica cuál de estos casos principales no es de unión de tres paredes.",
    [
      "Cuando las tres paredes forman una Y, un triedro o una flecha",
      "Cuando las tres paredes forman un triedro, una X o una Y",
      "Cuando las tres paredes forman una flecha, una X o una Y",
      "Cuando las tres paredes forman una X, un triedro o una flecha",
    ],
    2,
  ),
  single(
    "b3",
    60,
    "Según la primera ley del trazado:",
    [
      "Los diseños de piezas deben acotarse completamente, de forma que el modelista ejecute los modelos de acuerdo con las indicaciones del trazado",
      "Se tienen que diseñar piezas cuyos espesores sean constantes durante el moldeado",
      "Hay que diseñar las piezas de forma que se mantengan los espesores constantes y se supriman los cambios bruscos de sección",
      "Se utiliza en moldes pequeños de diseño sencillo, o en moldes grandes construidos con material resistente a la erosión",
    ],
    0,
  ),
  single("b3", 61, "Según la segunda ley del trazado, ¿cuál es la figura considerada ideal para el colado?", ["Cilindro", "Esfera", "Cubo", "Cono (tronco de cono)"], 1),
  single(
    "b3",
    62,
    "Entre los pasos que se utilizan para evitar las tensiones internas al trazar una pieza, ¿cuál es el paso erróneo?",
    [
      "Diseñar las piezas de forma que se mantengan los espesores constantes y se supriman los cambios bruscos de sección (ángulos vivos entrantes), sustituyéndolos por radios de unión o uniones progresivas",
      "Comenzar la colada por las partes más gruesas y desacelerar el enfriamiento de las más delgadas con enfriadores externos o internos",
      "Emplear moldes y machos lo bastante deformables para que cedan a la contracción",
      "Adoptar formas que puedan deformarse libremente sin crear rigidez local. Las tensiones de contracción, a lo sumo, solo deben producir flexiones elásticas",
    ],
    1,
  ),
  single(
    "b3",
    63,
    "¿Cuál es el control al que se somete la pieza fundida para controlar las grietas en las partes destinadas a manejar fluidos a presión?",
    ["Trazado", "Examen magnético o tintas penetrantes", "Por presión", "Rayos X, ultrasonido y gammagrafía"],
    2,
  ),
  single("b3", 64, "¿Cuál es el defecto que se produce cuando el metal filtra en la cavidad plana formada?", ["Cicatrices", "Sopladuras", "Porosidad", "Costuras"], 0),
  single(
    "b3",
    65,
    "Una de las causas por las que se producen «perdigones» o «gotas frías» es:",
    [
      "Insuficientes portadas de macho que aseguren la salida de gases",
      "Presencia de impurezas metálicas, tales como Al, Sb o Sn",
      "Después del bebedero no hay depósito de metal",
      "Elevada cantidad de adiciones en la cuchara",
    ],
    2,
  ),
  single("b3", 66, "¿Qué defecto posee una superficie de rotura decolorada?", ["Grietas y rajaduras en caliente", "Rechupes, cavidades y depresiones", "Piezas duras de temple", "Piezas alabeadas"], 0),
  single("b3", 67, "¿Qué tipo de piezas son inmecanizables al presentar una estructura completamente blanca?", ["Piezas incompletas por enfriamiento", "Piezas alabeadas", "Piezas duras de temple", "Piezas excéntricas y asimétricas"], 2),
];
