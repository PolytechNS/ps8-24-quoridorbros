class SocketMapper {
  static mapper = new Map();

  static updateSocket(id, socket) {
    SocketMapper.mapper.set(id, socket);
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
}

exports.SocketMapper = SocketMapper;
