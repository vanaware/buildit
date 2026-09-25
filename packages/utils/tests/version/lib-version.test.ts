import { describe, it, } from "@std/testing/bdd";
import { assertEquals, assertNotEquals, } from "@std/assert";
import {
  extractRawVersion,
  findDenoFile,
  sanitizeVersion,
} from "../../src/tools/version.ts";

describe("lib-version - Equivalente TypeScript de lib-version.sh", () => {
  describe("sanitizeVersion", () => {
    it("mantém versões semver puras inalteradas", () => {
      assertEquals(sanitizeVersion("1.2.3",), "1.2.3",);
      assertEquals(sanitizeVersion("0.3.14",), "0.3.14",);
      assertEquals(sanitizeVersion("10.20.30",), "10.20.30",);
    });

    it("remove prefixo 'v'", () => {
      assertEquals(sanitizeVersion("v1.2.3",), "1.2.3",);
      assertEquals(sanitizeVersion("v0.3.14",), "0.3.14",);
    });

    it("remove sufixo de hash (#hash)", () => {
      assertEquals(sanitizeVersion("0.3.14#muesu7z0",), "0.3.14",);
      assertEquals(sanitizeVersion("v1.2.3#abc1234",), "1.2.3",);
    });

    it("remove tags de pré-lançamento (-alpha, -beta.1)", () => {
      assertEquals(sanitizeVersion("1.2.3-alpha",), "1.2.3",);
      assertEquals(sanitizeVersion("2.0.0-rc.1",), "2.0.0",);
    });

    it("remove metadados de build (+build.123)", () => {
      assertEquals(sanitizeVersion("1.2.3+20130313144700",), "1.2.3",);
      assertEquals(sanitizeVersion("1.2.3-beta+exp.sha.5114f85",), "1.2.3",);
    });

    it("preenche componentes ausentes com 0", () => {
      assertEquals(sanitizeVersion("1.2",), "1.2.0",);
      assertEquals(sanitizeVersion("5",), "5.0.0",);
      assertEquals(sanitizeVersion("",), "0.0.0",);
    });

    it("descarta componentes além do patch (ex: 1.2.3.4.5)", () => {
      assertEquals(sanitizeVersion("1.2.3.4.5",), "1.2.3",);
    });

    it("retorna 0.0.0 para strings não numéricas inválidas", () => {
      assertEquals(sanitizeVersion("invalid",), "0.0.0",);
      assertEquals(sanitizeVersion("v",), "0.0.0",);
      assertEquals(sanitizeVersion("###",), "0.0.0",);
    });
  });

  describe("extractRawVersion", () => {
    it("extrai a versão ancorada em 'version'", () => {
      const jsonc =
        `{\n  "name": "meu-pacote",\n  "version": "0.3.14#abc1234",\n  "license": "MIT"\n}`;
      assertEquals(extractRawVersion(jsonc,), "0.3.14#abc1234",);
    });

    it("ignora espaços e tabulações ao redor de 'version'", () => {
      const jsonc = `{\n\t"version" \t : \t "1.0.0" \t,\n}`;
      assertEquals(extractRawVersion(jsonc,), "1.0.0",);
    });

    it("retorna null se não houver version", () => {
      const jsonc = `{\n  "name": "sem-versao"\n}`;
      assertEquals(extractRawVersion(jsonc,), null,);
    });
  });

  describe("findDenoFile", () => {
    it("localiza deno.jsonc no diretório do workspace", () => {
      const found = findDenoFile(".",);
      assertNotEquals(found, null,);
      assertEquals(found?.endsWith("deno.jsonc",), true,);
    });

    it("sobe a árvore de diretórios a partir de subpastas", () => {
      const found = findDenoFile("packages/utils/src",);
      assertNotEquals(found, null,);
    });

    it("retorna null para caminhos inexistentes fora do projeto", () => {
      const found = findDenoFile("/tmp/non-existent-dir-for-test-999",);
      assertEquals(found, null,);
    });
  });
});
