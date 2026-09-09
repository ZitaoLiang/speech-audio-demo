(() => {
  const tableModels = {
    proposed: ["ground-truth", "es117_l1", "es117_l1_ssim_gvar"],
    efficient: [
      "ground-truth",
      "efficientspeech-tiny",
      "es0_l1_ssim_gvar",
      "efficientspeech-small",
      "efficientspeech-base",
    ],
    others: [
      "ground-truth",
      "es117_l1_ssim_gvar",
      "lightspeech",
      "speedyspeech",
      "grad-tts",
      "matcha-tts",
      "mixer-tts",
      "fastspeech2",
    ],
  };

  const publicNames = {
    "ground-truth": "Ground Truth",
    es117_l1: "NanoSpeech (L1)",
    es117_l1_ssim_gvar: "NanoSpeech (L1+SSIM+GVar)",
    "efficientspeech-tiny": "EfficientSpeech-Tiny (L1)",
    es0_l1_ssim_gvar: "EfficientSpeech-Tiny (L1+SSIM+GVar)",
  };

  const formatParams = (value) => {
    if (value == null) return "reference";
    if (value < 1_000_000) return `${(value / 1_000).toFixed(1)}K params`;
    return `${(value / 1_000_000).toFixed(2)}M params`;
  };

  const renderTable = (manifest, ids) => {
    const models = ids.map((id) => manifest.models.find((model) => model.model_id === id));
    if (models.some((model) => !model)) throw new Error("A model listed by the page is missing from manifest.json.");

    const wrap = document.createElement("div");
    wrap.className = "audio-table-wrap";
    const table = document.createElement("table");
    table.className = "audio-table";

    const head = document.createElement("thead");
    const headRow = document.createElement("tr");
    const modelHead = document.createElement("th");
    modelHead.scope = "col";
    modelHead.textContent = "Model";
    headRow.appendChild(modelHead);
    manifest.samples.forEach((sample, index) => {
      const th = document.createElement("th");
      th.scope = "col";
      th.textContent = `Sample ${index + 1}`;
      th.title = `${sample.sample_id}: ${sample.text}`;
      headRow.appendChild(th);
    });
    head.appendChild(headRow);

    const body = document.createElement("tbody");
    models.forEach((model) => {
      const tr = document.createElement("tr");
      const th = document.createElement("th");
      th.scope = "row";
      const name = document.createElement("span");
      name.textContent = publicNames[model.model_id] || model.display_name;
      const metrics = document.createElement("small");
      const score = Number(model.mean_utmos_128).toFixed(3);
      metrics.textContent = `${formatParams(model.parameters)} · UTMOS ${score}`;
      th.append(name, metrics);
      tr.appendChild(th);

      model.files
        .slice()
        .sort((a, b) => a.sample_order - b.sample_order)
        .forEach((file, index) => {
          const td = document.createElement("td");
          const audio = document.createElement("audio");
          audio.controls = true;
          audio.preload = "none";
          audio.src = file.path;
          audio.setAttribute("aria-label", `${name.textContent}, sample ${index + 1}`);
          td.appendChild(audio);
          tr.appendChild(td);
        });
      body.appendChild(tr);
    });

    table.append(head, body);
    wrap.appendChild(table);
    return wrap;
  };

  fetch("manifest.json")
    .then((response) => {
      if (!response.ok) throw new Error("Could not load manifest.json.");
      return response.json();
    })
    .then((manifest) => {
      document.querySelectorAll(".audio-slot").forEach((slot) => {
        slot.replaceChildren(renderTable(manifest, tableModels[slot.dataset.table]));
      });

      const transcripts = document.querySelector("#transcript-list");
      transcripts.replaceChildren();
      manifest.samples
        .slice()
        .sort((a, b) => a.display_order - b.display_order)
        .forEach((sample) => {
          const item = document.createElement("li");
          const id = document.createElement("strong");
          id.textContent = `${sample.sample_id}: `;
          item.append(id, sample.text);
          transcripts.appendChild(item);
        });
    })
    .catch(() => {
      document.querySelectorAll(".audio-slot").forEach((slot) => {
        slot.innerHTML = '<p class="notice">Audio samples could not be loaded.</p>';
      });
      document.querySelector("#transcript-list").innerHTML = '<li class="notice">Transcripts could not be loaded.</li>';
    });
})();
