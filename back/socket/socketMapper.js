class SocketMapper {
  static mapper = new Map();

  static updateSocket(id, socket) {
    if (id === null) {
      console.log("l'id est nul");
      return;
    }
    SocketMapper.mapper.set(id, socket);
    this.toString();
  }

  static getSocketById(id) {
    return SocketMapper.mapper.get(id);
  }

  static removeSocketById(id) {
    const success = SocketMapper.mapper.delete(id);

    if (success) {
      console.log(`Socket supprimée avec succès pour l'ID ${id}`);
    } else {
      console.error(`Impossible de trouver l'ID ${id} dans le map.`);
    }
  }

  static toString() {
    console.log("Voici le mappe");
    this.mapper.forEach((value, key) => {
      console.log(`Clé: ${key}, Valeur: ${value.id}`);
    });
    console.log("\n");
  }
}

exports.SocketMapper = SocketMapper;
