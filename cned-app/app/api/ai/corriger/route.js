import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request) {
  try {
    const { type, question, reponse, section, cours, matiere } = await request.json();

    let systemPrompt = "";

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
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: type === "bac_blanc" ? 800 : 400,
      system: systemPrompt,
      messages: [{ role: "user", content: reponse || question }],
    });

    const reply = message.content.map((b) => b.text || "").join("");

    return Response.json({ success: true, reply });
  } catch (error) {
    console.error("AI API error:", error);
    return Response.json(
      { success: false, reply: "Erreur de connexion avec le professeur. Réessaie dans un instant." },
      { status: 500 }
    );
  }
}
