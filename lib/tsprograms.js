const TSPrograms = function constructor(pmt, packets) {
  this.pmt = pmt;
  this.packets = packets;
};

TSPrograms.prototype.getPrograms = function getPrograms() {
  let programs = [];

  Object.keys(this.pmt).filter(programType => this.pmt[programType] !== -1).forEach((programType) => {
    const pid = this.pmt[programType];
    const program = {
      id: pid,
      type: programType,
      packets: 0,
      pts: [],
    };
    this.packets.forEach((p) => {
      if (p.pid === program.id) {
        //program.packets.push(p);
        program.packets++;
        if (p.pts && program.pts.indexOf(p.pts) === -1) {
          program.pts.push(p.pts);
        }
      }
    });
    programs.push(program);
  });

  return programs;
};

module.exports = TSPrograms;