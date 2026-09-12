import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request) {
  try {
    const { type, question, reponse, section, cours, matiere, exercices, history } = await request.json();

    let systemPrompt = "";
    let maxTokens = 400;
    let userContent = reponse || question;

    if (type === "correction") {
      systemPrompt = `Tu es un professeur de ${matiere || "Français"} strict mais bienveillant pour un élève de Première CNED.
Cours du jour : "${cours || ""}". Section : "${section || ""}".
Question posée : "${question}".
Évalue la réponse de l'élève en 3-4 phrases maximum.
Si la réponse est correcte : félicite brièvement, ajoute un complément utile, termine par "Passons à la suite."
Si la réponse est incorrecte ou incomplète : explique pourquoi, donne la bonne réponse, termine par "Retravaille cette notion."
Sois exigeant sur la précision. Ne valide pas les réponses vagues.`;
    } else if (type === "aide") {
      systemPrompt = `Tu es un professeur de ${matiere || "Français"} strict. L'élève étudie "${cours || ""}", section "${section || ""}".
Il est bloqué et te pose une question. Réponds de manière pédagogique en 4-6 phrases.
Utilise des exemples concrets du cours. Ne donne PAS directement la réponse — guide l'élève vers la bonne réponse.
Si la question est hors-sujet, ramène-le gentiment au programme.`;
    } else if (type === "bac_blanc") {
      systemPrompt = `Tu es un correcteur du baccalauréat de ${matiere || "Français"}, strict et exigeant.
Corrige cette copie de bac blanc selon les critères officiels.
Note sur /20. Détaille les points forts et les points faibles.
Donne des conseils concrets d'amélioration.
Pour le français : vérifie la méthode (3P pour l'intro, O-C-E dans le développement, transitions, conclusion avec ouverture).
Pour les maths : vérifie la rigueur du raisonnement, la justification des étapes, le calcul.`;
    } else if (type === "reexplique") {
      // Pas de prof particulier dans cette matière : l'IA réexplique autrement + fournit un nouvel exercice
      maxTokens = 700;
      systemPrompt = `Tu es un professeur de ${matiere || ""} pour un élève de Première CNED, sans professeur particulier disponible dans cette matière — tu dois donc être son seul recours pour comprendre.
Contexte du cours : "${cours || ""}". Séance : "${section || ""}".
L'élève a été bloqué sur cet exercice :
Question : "${question}"
Sa réponse : "${reponse}"
Réponse attendue : correcte selon le corrigé du cours.

Réponds UNIQUEMENT avec un objet JSON valide, sans texte avant/après, sans balises markdown, au format exact :
{"explication": "une explication de la notion, avec un ANGLE DIFFÉRENT de celui du cours (autre exemple, autre analogie, autre méthode de mémorisation), en 4-6 phrases, ton pédagogique et encourageant", "nouvel_exercice": {"question": "un nouvel exercice sur EXACTEMENT la même notion mais avec un énoncé différent", "reponse": "la réponse attendue à ce nouvel exercice", "indice": "un indice court pour ce nouvel exercice"}}`;
      userContent = "Réexplique-moi cette notion autrement et donne-moi un nouvel exercice pour m'entraîner.";
    } else if (type === "analyse_difficultes") {
      // Analyse précise des difficultés accumulées pour préparer une séance avec le prof
      maxTokens = 900;
      systemPrompt = `Tu es un professeur de ${matiere || ""} qui prépare un point d'étape précis à destination d'un autre professeur particulier qui va donner une séance avec l'élève.
Voici la liste des erreurs et résultats de quiz de l'élève sur la période récente, au format JSON :
${JSON.stringify(exercices || [])}

Rédige une ANALYSE PÉDAGOGIQUE PRÉCISE (pas de généralités, pas juste "difficulté sur X") :
- Identifie les notions précises qui posent problème, en citant les erreurs concrètes observées (ex: "confond la formule du discriminant Δ=b²-4ac avec celle des racines")
- Explique le TYPE d'erreur (erreur de méthode, de calcul, de compréhension conceptuelle, d'inattention...)
- Si un pattern se répète sur plusieurs exercices, signale-le explicitement
- Propose 1-2 pistes concrètes de travail pour la séance
- Reste factuel, base-toi uniquement sur les données fournies, sans inventer
- Rédige en français, format texte simple (pas de markdown), 150-250 mots, à la 3e personne ("l'élève...")
Si la liste est vide, réponds juste "Aucune difficulté notable enregistrée sur cette période."`;
      userContent = "Analyse ces difficultés.";
    } else if (type === "bilan_semaine") {
      maxTokens = 2000;
      const diffData = exercices?.difficulties || [];
      const succData = exercices?.successes || [];
      systemPrompt = `Tu es un professeur de ${matiere || ""} de Première qui prépare un bilan hebdomadaire personnalisé pour un élève.

DONNÉES DE LA SEMAINE :
- Erreurs/difficultés : ${JSON.stringify(diffData)}
- Réussites : ${JSON.stringify(succData)}

Génère un bilan sous forme d'exercices personnalisés. Réponds UNIQUEMENT avec un JSON valide (pas de markdown, pas de texte autour) au format :
{"exercises": [
  {"type": "renforcement", "seance": "notion concernée", "question": "énoncé de l'exercice", "reponse": "réponse attendue (courte, vérifiable)", "indice": "un indice"},
  {"type": "defi", "seance": "notion concernée", "question": "exercice plus difficile", "reponse": "réponse attendue", "indice": "un indice"}
]}

RÈGLES :
- Si des DIFFICULTÉS existent : génère 3-4 exercices "renforcement" ciblés sur les erreurs concrètes (reformulés, pas identiques)
- Génère toujours 2-3 exercices "defi" plus difficiles sur les notions réussies ou le programme en cours
- Si AUCUNE donnée n'existe : génère 4-5 exercices "defi" variés couvrant les notions clés du programme de ${matiere} de Première
- Les réponses doivent être COURTES et VÉRIFIABLES (un nombre, une expression, un mot-clé) — pas de phrases longues
- Chaque exercice doit avoir un indice pédagogique
- Tout en français`;
      userContent = "Génère le bilan de la semaine.";
    }

    // Build messages array — include conversation history for "aide" type
    let apiMessages;
    if (type === "aide" && Array.isArray(history) && history.length > 0) {
      apiMessages = history.map(m => ({
        role: m.r === "user" ? "user" : "assistant",
        content: m.t
      }));
      // Ensure it starts with user and alternates properly
      if (apiMessages[0].role !== "user") apiMessages.shift();
      // Add current question
      apiMessages.push({ role: "user", content: userContent });
    } else {
      apiMessages = [{ role: "user", content: userContent }];
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: apiMessages,
    });

    const reply = message.content.map((b) => b.text || "").join("");

    if (type === "reexplique") {
      try {
        const cleaned = reply.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        return Response.json({ success: true, ...parsed });
      } catch {
        return Response.json({ success: false, explication: reply, nouvel_exercice: null });
      }
    }

    if (type === "bilan_semaine") {
      try {
        const cleaned = reply.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        return Response.json({ success: true, exercises: parsed.exercises || [] });
      } catch {
        return Response.json({ success: false, exercises: [], error: "Format invalide" });
      }
    }

    return Response.json({ success: true, reply });
  } catch (error) {
    console.error("AI API error:", error);
    return Response.json(
      { success: false, reply: "Erreur de connexion avec le professeur. Réessaie dans un instant." },
      { status: 500 }
    );
  }
}
