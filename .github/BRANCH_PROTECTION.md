# Instructions pour configurer la protection de branche sur GitHub

## 🛡️ Configuration recommandée pour la branche `main`

Pour bloquer les déploiements qui ne respectent pas vos checks, suivez ces étapes :

### 1. Aller dans les paramètres du repository
- Accédez à votre repository sur GitHub
- Cliquez sur **Settings** (Paramètres)
- Dans le menu de gauche, cliquez sur **Branches**

### 2. Ajouter une règle de protection pour `main`
Cliquez sur **Add rule** et configurez :

#### ✅ Checks obligatoires :
- ☑️ **Require status checks to pass before merging**
- ☑️ **Require branches to be up to date before merging**

#### ✅ Status checks requis (cochez tous) :
- `test` - Tests unitaires
- `lint` - Qualité du code
- `security` - Audit de sécurité
- `build-preview` - Build de validation
- `status-check` - Check final

#### ✅ Autres protections recommandées :
- ☑️ **Require a pull request before merging**
- ☑️ **Require approvals** (au moins 1)
- ☑️ **Dismiss stale PR approvals when new commits are pushed**
- ☑️ **Require review from code owners** (si vous avez un fichier CODEOWNERS)
- ☑️ **Restrict pushes that create files larger than 100 MB**
- ☑️ **Require signed commits** (optionnel, pour plus de sécurité)

#### ✅ Restrictions d'accès :
- ☑️ **Restrict who can push to matching branches**
- Ajoutez uniquement les administrateurs/mainteneurs

### 3. Règles additionnelles pour les déploiements
#### ✅ Environments (optionnel mais recommandé) :
1. Allez dans **Settings** > **Environments**
2. Créez un environment `github-pages`
3. Configurez :
   - ☑️ **Required reviewers** (optionnel)
   - ☑️ **Wait timer** (optionnel, ex: 5 minutes)
   - ☑️ **Deployment branches** : Only protected branches

## 🚦 Ce que ces règles bloquent :

### ❌ Déploiement bloqué si :
- Tests unitaires échouent (couverture < seuil)
- Erreurs de lint/formatting
- Vulnérabilités de sécurité détectées
- Build échoue ou est trop volumineux (>50MB)
- TypeScript errors
- Branch pas à jour avec main

### ✅ Déploiement autorisé seulement si :
- Tous les tests passent
- Code propre (lint + format)
- Audit de sécurité OK
- Build réussi et optimisé
- Pull Request approuvée
- Branch à jour

## 🔧 Commandes pour tester localement :

```bash
# Vérifier que tout passe avant de pusher
npm run test:coverage    # Tests + couverture
npm run lint            # Lint
npm run type-check      # TypeScript
npm run format:check    # Formatage
npm run security:check  # Sécurité
npm run build          # Build
npx knip               # Nettoyage

# Corriger automatiquement ce qui peut l'être
npm run lint:fix       # Corrige le lint
npm run format         # Corrige le formatage
npm run security:fix   # Corrige les vulnérabilités
```

## 📊 Monitoring et alertes :

### GitHub Status Checks
- ✅ Tous les checks doivent être verts
- 🔄 Les checks se relancent automatiquement sur nouveau commit
- 📧 Notifications par email si échec

### Artifacts et Reports
- 📦 Build artifacts conservés 7 jours (deploy) / 3 jours (PR)
- 📊 Reports de couverture disponibles
- 🧹 Reports Knip pour le nettoyage

## 🆘 En cas de problème :

### Bypass temporaire (admin uniquement) :
- Décochez temporairement les protections
- Mergez le fix urgent
- Remettez les protections immédiatement

### Debug d'un check qui échoue :
1. Regardez les logs dans l'onglet "Actions"
2. Téléchargez les artifacts pour investigation
3. Reproduisez localement avec les commandes ci-dessus
4. Corrigez et repoussez

---

**⚠️ Important** : Ces protections garantissent la qualité mais peuvent parfois bloquer des fixes urgents. Assurez-vous qu'au moins un admin peut bypasser temporairement si nécessaire.
