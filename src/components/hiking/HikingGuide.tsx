import React, { useState } from 'react';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';

interface GuideStepProps {
  step: number;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function GuideStep({
  step,
  title,
  children,
  defaultOpen = false,
}: GuideStepProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-lg mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
            {step}
          </div>
          <h3 className="font-semibold text-gray-800">{title}</h3>
        </div>
        {isOpen ? (
          <FaChevronDown className="w-4 h-4 text-gray-500" />
        ) : (
          <FaChevronRight className="w-4 h-4 text-gray-500" />
        )}
      </button>

      {isOpen && (
        <div className="px-4 pb-4">
          <div className="pl-11">{children}</div>
        </div>
      )}
    </div>
  );
}

export default function HikingGuide(): React.JSX.Element {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          🥾 Guide d'utilisation du Planificateur de Randonnée
        </h1>
        <p className="text-lg text-gray-600">
          Créez des itinéraires de randonnée professionnels en quelques étapes
        </p>
      </div>

      <div className="space-y-4">
        <GuideStep
          step={1}
          title="Choisir le type de sentiers"
          defaultOpen={true}
        >
          <div className="space-y-3">
            <p className="text-gray-600">
              Sélectionnez votre préférence pour les types de chemins dans
              l'onglet "Profil" :
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <strong className="text-red-600">
                  🏔️ Sentiers officiels :
                </strong>{' '}
                GR, GRP, PR, HRP uniquement
              </li>
              <li>
                <strong className="text-orange-600">🗺️ Chemins mixtes :</strong>{' '}
                Privilégie les officiels mais autorise les autres
              </li>
              <li>
                <strong className="text-purple-600">
                  ⛰️ Sentiers montagne :
                </strong>{' '}
                Tous types de sentiers en montagne
              </li>
              <li>
                <strong className="text-green-600">🧭 Sans préférence :</strong>{' '}
                Tous types de chemins
              </li>
            </ul>
          </div>
        </GuideStep>

        <GuideStep step={2} title="Configurer l'itinéraire">
          <div className="space-y-3">
            <p className="text-gray-600">
              Dans l'onglet "Planning", définissez votre itinéraire :
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <strong>Type :</strong> Linéaire (A vers B) ou Boucle (retour au
                départ)
              </li>
              <li>
                <strong>Étapes :</strong> Divisez en 1 à 10 étapes (curseur ou
                +/-)
              </li>
              <li>
                <strong>Points :</strong> Ajoutez jusqu'à 20 points de passage
              </li>
            </ul>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
              <p className="text-sm text-blue-700">
                💡 <strong>Astuce :</strong> Plus vous ajoutez d'étapes, plus
                l'itinéraire sera découpé finement
              </p>
            </div>
          </div>
        </GuideStep>

        <GuideStep step={3} title="Positionner les points sur la carte">
          <div className="space-y-3">
            <p className="text-gray-600">
              Placez vos points de passage directement sur la carte :
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                • <strong>Clic sur la carte :</strong> Place automatiquement le
                prochain point
              </li>
              <li>
                • <strong>Nommage :</strong> Donnez un nom à chaque point pour
                l'identifier
              </li>
              <li>
                • <strong>Suppression :</strong> Utilisez le bouton "-" (minimum
                2 points)
              </li>
              <li>
                • <strong>Réorganisation :</strong> Modifiez l'ordre avec les
                champs de texte
              </li>
            </ul>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
              <p className="text-sm text-yellow-700">
                ⚠️ <strong>Important :</strong> Tous les points doivent être
                positionnés (lat/lng ≠ 0)
              </p>
            </div>
          </div>
        </GuideStep>

        <GuideStep step={4} title="Générer l'itinéraire">
          <div className="space-y-3">
            <p className="text-gray-600">
              Une fois tous les paramètres configurés :
            </p>
            <ol className="space-y-2 text-sm list-decimal list-inside">
              <li>
                Cliquez sur <strong>"Créer l'itinéraire"</strong>
              </li>
              <li>
                L'application calcule le tracé optimal selon vos préférences
              </li>
              <li>Le profil altimétrique est généré automatiquement</li>
              <li>
                Les refuges et points d'eau sont recherchés le long du parcours
              </li>
            </ol>
            <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded">
              <p className="text-sm text-green-700">
                ✅ <strong>Résultat :</strong> Itinéraire complet avec toutes
                les informations
              </p>
            </div>
          </div>
        </GuideStep>

        <GuideStep step={5} title="Analyser le profil altimétrique">
          <div className="space-y-3">
            <p className="text-gray-600">L'onglet "Profil" vous montre :</p>
            <ul className="space-y-2 text-sm">
              <li>
                <strong className="text-green-600">Dénivelé + :</strong> Montée
                cumulée en mètres
              </li>
              <li>
                <strong className="text-red-600">Dénivelé - :</strong> Descente
                cumulée en mètres
              </li>
              <li>
                <strong className="text-blue-600">Distance :</strong> Kilomètres
                total
              </li>
              <li>
                <strong className="text-purple-600">Altitude :</strong> Min et
                max de l'itinéraire
              </li>
              <li>
                <strong>Graphique :</strong> Profil style course avec marqueurs
                d'étapes
              </li>
            </ul>
            <div className="bg-purple-50 border-l-4 border-purple-400 p-3 rounded">
              <p className="text-sm text-purple-700">
                📊 <strong>Comme les trails :</strong> Visualisation identique
                aux profils de courses
              </p>
            </div>
          </div>
        </GuideStep>

        <GuideStep step={6} title="Explorer les points d'intérêt">
          <div className="space-y-3">
            <p className="text-gray-600">
              L'onglet "POI" liste automatiquement :
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">🏠 Refuges</h4>
                <ul className="space-y-1 text-xs">
                  <li>
                    • <strong>Gardés :</strong> Avec gardien, repas, réservation
                  </li>
                  <li>
                    • <strong>Libres :</strong> Accès libre, pas de service
                  </li>
                  <li>
                    • <strong>Bivouacs :</strong> Zones camping autorisées
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">
                  💧 Points d'eau
                </h4>
                <ul className="space-y-1 text-xs">
                  <li>
                    • <strong>Sources :</strong> Eau naturelle à traiter
                  </li>
                  <li>
                    • <strong>Fontaines :</strong> Eau potable publique
                  </li>
                  <li>
                    • <strong>Rivières/Lacs :</strong> Nécessite purification
                  </li>
                </ul>
              </div>
            </div>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
              <p className="text-sm text-blue-700">
                👆 <strong>Interactif :</strong> Cliquez sur un élément pour le
                localiser sur la carte
              </p>
            </div>
          </div>
        </GuideStep>

        <GuideStep step={7} title="Exporter en GPX">
          <div className="space-y-3">
            <p className="text-gray-600">
              L'onglet "Export" permet de télécharger votre itinéraire :
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <strong>Options configurables :</strong>
              </li>
              <li className="ml-4">
                • Points de passage (départ, arrivée, intermédiaires)
              </li>
              <li className="ml-4">• Refuges trouvés avec informations</li>
              <li className="ml-4">• Points d'eau avec qualité</li>
              <li className="ml-4">• Données d'altitude pour profil 3D</li>
              <li className="ml-4">
                • Séparation par étapes (fichiers multiples)
              </li>
            </ul>
            <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded">
              <p className="text-sm text-green-700">
                📱 <strong>Compatible :</strong> Garmin, Suunto, Strava, Komoot,
                etc.
              </p>
            </div>
          </div>
        </GuideStep>

        <GuideStep step={6} title="Cartes IGN et visualisation">
          <div className="space-y-3">
            <p className="text-gray-600">
              Utilisez les cartes IGN France pour une précision topographique
              exceptionnelle :
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">
                  🗺️ Cartes topographiques IGN
                </h4>
                <ul className="space-y-1 text-sm text-blue-700">
                  <li>• Courbes de niveau détaillées</li>
                  <li>• Sentiers officiels et non-officiels</li>
                  <li>• Relief et végétation précis</li>
                  <li>• Parfait pour la randonnée en France</li>
                </ul>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">
                  📸 Autres fonds de carte
                </h4>
                <ul className="space-y-1 text-sm text-green-700">
                  <li>• Plan IGN : cartes routières détaillées</li>
                  <li>• Satellite IGN : images aériennes</li>
                  <li>• OpenStreetMap : cartes libres mondiales</li>
                  <li>• Changement facile via l'icône couches</li>
                </ul>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
              <p className="text-sm text-yellow-700">
                <strong>💡 Astuce :</strong> Les cartes IGN avec courbes de
                niveau sont idéales pour analyser la difficulté du terrain et
                planifier vos pauses. Cliquez sur l'icône couches en haut à
                droite de la carte pour changer de fond.
              </p>
            </div>
          </div>
        </GuideStep>
      </div>

      {/* Tips and tricks section */}
      <div className="mt-12 bg-gray-50 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          💡 Conseils et astuces
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">
              🎯 Optimisation
            </h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>
                • Limitez-vous à 10-15 points maximum pour de meilleures
                performances
              </li>
              <li>• Utilisez le mode boucle pour les randonnées circulaires</li>
              <li>• Vérifiez la disponibilité saisonnière des refuges</li>
              <li>• Planifiez vos étapes selon votre niveau</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-2">⚠️ Sécurité</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Toujours purifier l'eau des sources naturelles</li>
              <li>• Vérifiez la météo avant le départ</li>
              <li>• Informez quelqu'un de votre itinéraire</li>
              <li>• Emportez une carte papier de secours</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Technical requirements */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">
          🔧 Prérequis techniques
        </h3>
        <div className="space-y-2 text-sm text-blue-700">
          <p>
            <strong>APIs intégrées :</strong>
          </p>
          <ul className="space-y-1 ml-4">
            <li>
              • <strong>OpenRouteService :</strong> Calcul d'itinéraires (✅
              configuré)
            </li>
            <li>
              • <strong>IGN Géoportail :</strong> Cartes françaises avec courbes
              de niveau (✅ activé)
            </li>
            <li>
              • <strong>Open-Elevation :</strong> Données d'altitude (✅
              intégré)
            </li>
            <li>
              • <strong>Overpass :</strong> Refuges et points d'eau (✅
              fonctionnel)
            </li>
          </ul>
          <p className="mt-3">
            <strong>🎯 Status :</strong> Toutes les fonctionnalités sont
            opérationnelles pour la randonnée en France !
          </p>
        </div>
      </div>
    </div>
  );
}
