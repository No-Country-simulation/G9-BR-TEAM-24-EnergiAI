package com.g9.energiacore.energiai.infra.storage;

import java.io.InputStream;

/* 
 * Pra que possmos garantir que a futura migração pra OCI não quebre o codigo que a nossa equipe vai escrever,
 * estamos aplicando arquivo um principio SOLID, o DIP, onde a camada de negócio não deve saber de onde o modelo 
 * de IA vem, apenas que ela existe
 * */
public interface ModelStorageService {
  /**
   * Recupera o arquivo do modelo de IA (ex: .onnx)
   */

  InputStream getModelFile();
}
