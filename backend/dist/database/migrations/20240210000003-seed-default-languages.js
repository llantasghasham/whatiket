"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
    up: async (queryInterface) => {
        const now = new Date();
        return queryInterface.bulkInsert("Languages", [
            {
                code: "pt-BR",
                name: "Português",
                active: true,
                createdAt: now,
                updatedAt: now
            },
            {
                code: "en",
                name: "English",
                active: true,
                createdAt: now,
                updatedAt: now
            },
            {
                code: "es",
                name: "Español",
                active: true,
                createdAt: now,
                updatedAt: now
            }
        ]);
    },
    down: async (queryInterface) => {
        return queryInterface.bulkDelete("Languages", {});
    }
};
