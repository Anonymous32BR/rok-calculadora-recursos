const TIPOS = ["infantaria", "arqueiros", "cavalaria", "siege"];
const NIVEIS = ["T1", "T2", "T3", "T4", "T5"];

export function validate(data) {
    if (!Array.isArray(data?.unidades)) {
        throw new Error("OCR inválido: unidades ausentes");
    }

    if (data.unidades.length === 0) {
        throw new Error("OCR vazio");
    }

    data.unidades.forEach((u, i) => {
        if (!TIPOS.includes(u.tipo)) {
            throw new Error(`Tipo inválido no card ${i}: ${u.tipo}`);
        }

        if (!NIVEIS.includes(u.nivel)) {
            throw new Error(`Nível inválido no card ${i}: ${u.nivel}`);
        }

        if (typeof u.quantidade !== "number") {
            throw new Error(`Quantidade inválida no card ${i}: ${u.quantidade}`);
        }
    });

    return true;
}
